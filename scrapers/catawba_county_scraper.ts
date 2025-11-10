import puppeteer from 'puppeteer';
import type { PropertyData } from './types.js';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeCatawba(): Promise<PropertyData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://catawbacountync.gov/county-services/tax/online-search/search-foreclosure-sales/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // Find all table rows (both thead and tbody)
      const tables = Array.from(document.querySelectorAll('table'));
      
      for (const table of tables) {
        // Get all tr elements from both thead and tbody
        const allRows = Array.from(table.querySelectorAll('tr'));
        
        for (const row of allRows) {
          const cells = row.querySelectorAll('td');
          
          // Skip rows with h3 tags (headers)
          if (row.querySelector('h3')) continue;
          
          // We need at least 6 cells for a valid property row
          if (cells.length >= 6) {
            const ownerText = cells[0]?.textContent?.trim() || '';
            const addressText = cells[1]?.textContent?.trim() || '';
            const parcelText = cells[2]?.textContent?.trim() || '';
            const dateText = cells[3]?.textContent?.trim() || '';
            const bidText = cells[4]?.textContent?.trim() || '';
            const caseText = cells[5]?.textContent?.trim() || '';

            // Only add if we have address and parcel (minimum required fields)
            if (addressText && parcelText && addressText.length > 5) {
              results.push({
                owner: ownerText,
                address: addressText,
                parcelId: parcelText,
                auctionDate: dateText,
                startingBid: bidText,
                caseNumber: caseText,
              });
            }
          }
        }
      }
      
      return results;
    });

    const propertyData: PropertyData[] = properties.map((prop) => {
      // Parse sale date
      let saleDate: Date | undefined;
      if (prop.auctionDate && prop.auctionDate !== 'PENDING') {
        try {
          const parsed = new Date(prop.auctionDate);
          // Validate the date is actually valid
          if (!isNaN(parsed.getTime())) {
            saleDate = parsed;
          }
        } catch (e) {
          // Invalid date - leave undefined
        }
      }

      // Parse opening bid
      let openingBid: number | undefined;
      if (prop.startingBid && prop.startingBid.includes('$')) {
        const bidStr = prop.startingBid.replace(/[^0-9.]/g, '');
        openingBid = bidStr ? parseFloat(bidStr) : undefined;
      }

      const county = standardizeCountyName('Catawba');

      return {
        county,
        address: prop.address,
        parcelId: prop.parcelId,
        saleDate,
        openingBid,
        caseNumber: prop.caseNumber,
        saleStatus: saleDate ? 'scheduled' : 'pending',
        source: 'catawba_county',
        sourceType: 'county_website',
        sourceUrl: 'https://catawbacountync.gov/county-services/tax/online-search/search-foreclosure-sales/',
      };
    });

    console.log(`Catawba County: Found ${propertyData.length} properties`);
    return propertyData;
  } finally {
    await browser.close();
  }
}

// Allow running directly for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeCatawba()
    .then((properties) => {
      console.log(JSON.stringify(properties, null, 2));
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
