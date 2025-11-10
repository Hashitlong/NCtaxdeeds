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
      
      // Try multiple parsing strategies
      
      // Strategy 1: Look for property cards/containers
      const cards = document.querySelectorAll('.card, [class*="property"], [class*="listing"]');
      if (cards.length > 0) {
        console.log(`[Cabarrus] Found ${cards.length} property cards`);
        cards.forEach(card => {
          const text = card.textContent || '';
          const prop: any = {};
          
          // Extract data using regex patterns
          const realIdMatch = text.match(/Real ID[:\s]+([^\n]+)/i);
          const statusMatch = text.match(/Status[:\s]+([^\n]+)/i);
          const caseMatch = text.match(/Case Number[:\s]+([^\n]+)/i);
          const taxMatch = text.match(/Tax Value[:\s]+([^\n]+)/i);
          const minBidMatch = text.match(/Min Bid[:\s]+([^\n]+)/i);
          const saleDateMatch = text.match(/Sale Date[:\s]+([^\n]+)/i);
          const saleTimeMatch = text.match(/Sale Time[:\s]+([^\n]+)/i);
          const ownerMatch = text.match(/Owner[:\s]+([^\n]+)/i);
          const attorneyMatch = text.match(/Attorney[:\s]+([^\n]+)/i);
          
          if (realIdMatch) {
            prop.realId = realIdMatch[1].trim();
            prop.status = statusMatch ? statusMatch[1].trim() : '';
            prop.caseNumber = caseMatch ? caseMatch[1].trim() : '';
            prop.taxValue = taxMatch ? taxMatch[1].trim() : '';
            prop.minBid = minBidMatch ? minBidMatch[1].trim() : '';
            prop.saleDate = saleDateMatch ? saleDateMatch[1].trim() : '';
            prop.saleTime = saleTimeMatch ? saleTimeMatch[1].trim() : '';
            prop.owner = ownerMatch ? ownerMatch[1].trim() : '';
            prop.attorney = attorneyMatch ? attorneyMatch[1].trim() : '';
            results.push(prop);
          }
        });
      }
      
      // Strategy 2: Fallback to line-by-line parsing if no cards found
      if (results.length === 0) {
        console.log('[Cabarrus] No cards found, trying line-by-line parsing');
        const textContent = document.body.innerText;
        const lines = textContent.split('\n');
        
        let currentProperty: any = {};
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.startsWith('Real ID:')) {
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
        
        if (currentProperty.realId) {
          results.push(currentProperty);
        }
      }
      
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
