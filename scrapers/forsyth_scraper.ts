import puppeteer from 'puppeteer';
import type { ScrapedProperty } from './types.js';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeForsyth(): Promise<ScrapedProperty[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to Forsyth County foreclosures page...');
    
    await page.goto('https://www.forsyth.cc/tax/foreclosure_prop.aspx', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract property data
    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // The page structure has property sections marked by h4 tags with addresses
      // followed by paragraphs with case numbers and tables with details
      const headers = Array.from(document.querySelectorAll('h4'));
      
      headers.forEach((header) => {
        const addressText = header.textContent?.trim() || '';
        if (!addressText) return;
        
        const data: any = {
          address: addressText,
          county: standardizeCountyName('Forsyth'),
        };
        
        // Get the next sibling elements to find case number and table
        let currentElement = header.nextElementSibling;
        
        // Look for case number in the next paragraph or italic element
        while (currentElement && results.length < 100) {
          const text = currentElement.textContent || '';
          
          // Check for case number
          if (text.includes('Case Number:')) {
            const caseMatch = text.match(/Case Number:\s*(.+)/i);
            if (caseMatch) {
              data.caseNumber = caseMatch[1].trim();
            }
          }
          
          // Check if this is a table with property details
          if (currentElement.tagName === 'TABLE') {
            const rows = currentElement.querySelectorAll('tr');
            rows.forEach((row) => {
              const cells = row.querySelectorAll('td');
              if (cells.length >= 2) {
                const label = cells[0].textContent?.trim().toLowerCase() || '';
                const value = cells[1].textContent?.trim() || '';
                
                if (label.includes('status')) {
                  data.status = value;
                } else if (label.includes('pin')) {
                  data.pin = value;
                } else if (label.includes('block')) {
                  data.blockLot = value;
                } else if (label.includes('tax value')) {
                  data.taxValue = value;
                } else if (label.includes('min bid')) {
                  data.minBid = value;
                } else if (label.includes('owner')) {
                  data.owner = value;
                } else if (label.includes('description')) {
                  data.description = value;
                } else if (label.includes('sale date')) {
                  data.saleDateTime = value;
                } else if (label.includes('sale location')) {
                  data.saleLocation = value;
                } else if (label.includes('attorney')) {
                  data.attorney = value;
                }
              }
            });
            
            // After finding the table, we're done with this property
            break;
          }
          
          // Move to next sibling
          currentElement = currentElement.nextElementSibling;
          
          // Stop if we hit another h4 (next property)
          if (currentElement && currentElement.tagName === 'H4') {
            break;
          }
        }
        
        if (data.pin || data.caseNumber) {
          results.push(data);
        }
      });
      
      return results;
    });

    console.log(`Found ${properties.length} properties in Forsyth County`);

    // Transform to standard format
    const scrapedProperties: ScrapedProperty[] = properties.map((prop) => {
      // Parse sale date and time
      let saleDate = null;
      let saleTime = null;
      if (prop.saleDateTime) {
        const dateTimeMatch = prop.saleDateTime.match(/(\w+\s+\d+\s+\d+)\s*:\s*(\d+\s*\d*\s*[AP]M)/i);
        if (dateTimeMatch) {
          saleDate = dateTimeMatch[1];
          saleTime = dateTimeMatch[2];
        }
      }
      
      // Determine sale status
      let saleStatus = 'scheduled';
      if (prop.status) {
        const statusLower = prop.status.toLowerCase();
        if (statusLower.includes('upset bid')) {
          saleStatus = 'upset_period';
        } else if (statusLower.includes('pending')) {
          saleStatus = 'pending';
        } else if (statusLower.includes('sold')) {
          saleStatus = 'sold';
        } else if (statusLower.includes('postponed')) {
          saleStatus = 'postponed';
        }
      }
      
      // Parse opening bid
      let openingBid = null;
      if (prop.minBid && prop.minBid !== '$') {
        const bidMatch = prop.minBid.match(/\$?([\d,]+)/);
        if (bidMatch) {
          openingBid = bidMatch[1].replace(/,/g, '');
        }
      }
      
      return {
        county: standardizeCountyName('Forsyth'),
        address: prop.address || prop.description || '',
        parcelId: prop.pin || null,
        saleDate,
        saleTime,
        saleStatus,
        openingBid,
        currentBid: null,
        upsetBidCloseDate: null,
        propertyType: null,
        caseNumber: prop.caseNumber || null,
        source: 'forsyth',
        sourceType: 'county_website',
        rawData: JSON.stringify(prop),
      };
    });

    return scrapedProperties;
  } catch (error) {
    console.error('Error scraping Forsyth County:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Test the scraper if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeForsyth()
    .then((properties) => {
      console.log(JSON.stringify(properties, null, 2));
    })
    .catch((error) => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
