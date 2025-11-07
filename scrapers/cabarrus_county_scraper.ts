import puppeteer from 'puppeteer';
import type { PropertyData } from './types.js';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeCabarrus(): Promise<PropertyData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://foreclosures.cabarruscounty.us/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for property cards to load
    await page.waitForSelector('img[alt="Image"]', { timeout: 10000 }).catch(() => {
      console.log('No property images found, continuing anyway');
    });

    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // The page content shows property data in a specific format
      // Real ID, Status, Case Number, Tax Value, Min Bid, Sale Date, Sale Time, Owner, Attorney
      const textContent = document.body.innerText;
      const lines = textContent.split('\n');
      
      let currentProperty: any = {};
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('Real ID:')) {
          // Start of a new property
          if (currentProperty.realId) {
            results.push({ ...currentProperty });
          }
          currentProperty = {
            realId: line.replace('Real ID:', '').trim(),
          };
        } else if (line.startsWith('Status:')) {
          currentProperty.status = line.replace('Status:', '').trim();
        } else if (line.startsWith('Case Number:')) {
          currentProperty.caseNumber = line.replace('Case Number:', '').trim();
        } else if (line.startsWith('Tax Value:')) {
          currentProperty.taxValue = line.replace('Tax Value:', '').trim();
        } else if (line.startsWith('Min Bid:')) {
          currentProperty.minBid = line.replace('Min Bid:', '').trim();
        } else if (line.startsWith('Sale Date:')) {
          currentProperty.saleDate = line.replace('Sale Date:', '').trim();
        } else if (line.startsWith('Sale Time:')) {
          currentProperty.saleTime = line.replace('Sale Time:', '').trim();
        } else if (line.startsWith('Owner:')) {
          currentProperty.owner = line.replace('Owner:', '').trim();
        } else if (line.startsWith('Attorney:')) {
          currentProperty.attorney = line.replace('Attorney:', '').trim();
        }
      }
      
      // Add the last property
      if (currentProperty.realId) {
        results.push(currentProperty);
      }
      
      return results;
    });

    const propertyData: PropertyData[] = properties.map((prop) => {
      // Parse sale date
      let saleDate: Date | undefined;
      if (prop.saleDate && prop.saleDate !== 'PENDING') {
        try {
          saleDate = new Date(prop.saleDate);
        } catch (e) {
          // Invalid date
        }
      }

      // Parse opening bid
      let openingBid: number | undefined;
      if (prop.minBid) {
        const bidStr = prop.minBid.replace(/[^0-9.]/g, '');
        openingBid = bidStr ? parseFloat(bidStr) : undefined;
      }

      // Determine sale status
      let saleStatus: string = 'pending';
      if (prop.status) {
        const status = prop.status.toLowerCase();
        if (status.includes('sale scheduled')) {
          saleStatus = 'scheduled';
        } else if (status.includes('upset bid')) {
          saleStatus = 'upset_period';
        } else if (status.includes('pending')) {
          saleStatus = 'pending';
        }
      }

      const county = standardizeCountyName('Cabarrus');

      return {
        county,
        parcelId: prop.realId,
        saleDate,
        openingBid,
        caseNumber: prop.caseNumber,
        saleStatus,
        assessedValue: prop.taxValue?.replace(/[^0-9.]/g, ''),
        source: 'cabarrus_county',
        sourceType: 'county_website',
        sourceUrl: 'https://foreclosures.cabarruscounty.us/',
      };
    });

    console.log(`Cabarrus County: Found ${propertyData.length} properties`);
    return propertyData;
  } finally {
    await browser.close();
  }
}

// Allow running directly for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeCabarrus()
    .then((properties) => {
      console.log(JSON.stringify(properties, null, 2));
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
