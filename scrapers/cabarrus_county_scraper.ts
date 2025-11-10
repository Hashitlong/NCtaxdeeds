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

    // Wait for content to load - try multiple selectors
    await Promise.race([
      page.waitForSelector('img[alt="Image"]', { timeout: 10000 }),
      page.waitForSelector('.card', { timeout: 10000 }),
      page.waitForSelector('[class*="property"]', { timeout: 10000 }),
      new Promise(resolve => setTimeout(resolve, 5000)) // Fallback timeout
    ]).catch(() => {
      console.log('[Cabarrus] Waiting for initial content...');
    });

    // Give page extra time to fully render
    await new Promise(resolve => setTimeout(resolve, 3000));

    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // Get all text content and parse it
      const textContent = document.body.innerText;
      
      // Split by "Real ID" to get individual properties
      const propertyBlocks = textContent.split(/(?=Real ID)/i).filter(block => block.trim().length > 0);
      
      console.log(`[Cabarrus] Found ${propertyBlocks.length} property blocks`);
      
      propertyBlocks.forEach(block => {
        // Extract each field using regex with word boundaries
        const realIdMatch = block.match(/Real ID[:\s]+([^\s]+)/i);
        const statusMatch = block.match(/Status[:\s]+([A-Z\s]+?)(?=\s+Case Number|\s+Tax Value|$)/i);
        const caseMatch = block.match(/Case Number[:\s]+([^\s]+)/i);
        const taxMatch = block.match(/Tax Value[:\s]+\$?([\d,]+)/i);
        const minBidMatch = block.match(/Min Bid[:\s]+\$?([\d,]+)/i);
        const saleDateMatch = block.match(/Sale Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4}|PENDING)/i);
        const saleTimeMatch = block.match(/Sale Time[:\s]+(\d{1,2}:\d{2}\s*[AP]M|PENDING)/i);
        const ownerMatch = block.match(/Owner[:\s]+([^\n]+?)(?=\s+Attorney|$)/i);
        const attorneyMatch = block.match(/Attorney[:\s]+([^\n]+?)$/i);
        
        if (realIdMatch) {
          const prop: any = {
            realId: realIdMatch[1].trim(),
            status: statusMatch ? statusMatch[1].trim() : '',
            caseNumber: caseMatch ? caseMatch[1].trim() : '',
            taxValue: taxMatch ? taxMatch[1].replace(/,/g, '') : '',
            minBid: minBidMatch ? minBidMatch[1].replace(/,/g, '') : '',
            saleDate: saleDateMatch ? saleDateMatch[1].trim() : '',
            saleTime: saleTimeMatch ? saleTimeMatch[1].trim() : '',
            owner: ownerMatch ? ownerMatch[1].trim() : '',
            attorney: attorneyMatch ? attorneyMatch[1].trim() : ''
          };
          results.push(prop);
        }
      });
      
      console.log(`[Cabarrus] Extracted ${results.length} properties`);
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
