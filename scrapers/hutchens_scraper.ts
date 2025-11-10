import puppeteer from 'puppeteer';
import { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

/**
 * Scraper for Hutchens Law Firm Foreclosure Sales
 * URL: https://sales.hutchenslawfirm.com/NCfcSalesList.aspx
 * Covers multiple NC counties
 */

export async function scrapeHutchens(): Promise<PropertyData[]> {
  console.log('Starting Hutchens Law Firm scraper...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://sales.hutchenslawfirm.com/NCfcSalesList.aspx', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('Page loaded, waiting for table...');
    
    // Wait for the table to be present
    await page.waitForSelector('table', { timeout: 10000 });

    // Extract all property data from the table
    const properties = await page.evaluate(() => {
      const results: any[] = [];
      const rows = document.querySelectorAll('table tr');
      
      // Skip header row (index 0) - it has <th> elements, not <td>
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        
        if (cells.length < 8) continue; // Skip if not enough columns
        
        const caseNo = cells[0]?.textContent?.trim() || null;
        const spNumber = cells[1]?.textContent?.trim() || null;
        const county = cells[2]?.textContent?.trim() || null;
        const saleDate = cells[3]?.textContent?.trim() || null;
        const propertyAddress = cells[4]?.textContent?.trim() || null;
        const propertyCsz = cells[5]?.textContent?.trim() || null; // City, State, ZIP
        const deedOfTrust = cells[6]?.textContent?.trim() || null;
        const bidAmount = cells[7]?.textContent?.trim() || null;
        
        // Validate that county looks like a county name (contains letters, not just numbers/dashes)
        const countyValid = county && /[a-zA-Z]{3,}/.test(county);
        // Validate that address doesn't look like a county name
        const addressValid = propertyAddress && propertyAddress.length > 5;
        
        if (!countyValid || !addressValid) {
          console.log(`[Hutchens] Skipping invalid row ${i}: county="${county}", address="${propertyAddress}"`);
          continue;
        }
        
        results.push({
          caseNo,
          spNumber,
          county,
          saleDate,
          propertyAddress,
          propertyCsz,
          deedOfTrust,
          bidAmount
        });
      }
      
      return results;
    });

    console.log(`Found ${properties.length} properties from Hutchens Law Firm`);

    // Transform to PropertyData format
    const transformedProperties: PropertyData[] = properties.map((prop: any) => {
      // Parse sale date
      let saleDate: Date | null = null;
      if (prop.saleDate) {
        const parsed = new Date(prop.saleDate);
        if (!isNaN(parsed.getTime())) {
          saleDate = parsed;
        }
      }

      // Parse bid amount and upset bid close date
      let openingBid: number | null = null;
      let currentBid: number | null = null;
      let upsetBidCloseDate: Date | null = null;
      let saleStatus: 'scheduled' | 'in_upset_period' | 'pending' | 'sold' = 'scheduled';
      
      if (prop.bidAmount) {
        // Check for upset bid format: "Bid upset 10/30/2025, increasing bid to $266,771.65"
        const upsetMatch = prop.bidAmount.match(/Bid upset (\d{1,2}\/\d{1,2}\/\d{4}), increasing bid to \$([0-9,]+\.?\d*)/);
        if (upsetMatch) {
          // Parse upset deadline date
          const deadlineStr = upsetMatch[1];
          const parsedDeadline = new Date(deadlineStr);
          if (!isNaN(parsedDeadline.getTime())) {
            upsetBidCloseDate = parsedDeadline;
            // Property is in upset period
            const now = new Date();
            if (upsetBidCloseDate > now) {
              saleStatus = 'in_upset_period';
            } else {
              saleStatus = 'sold';
            }
          }
          // Parse current bid amount (convert dollars to cents)
          const bidAmount = upsetMatch[2].replace(/,/g, '');
          const parsed = parseFloat(bidAmount);
          if (!isNaN(parsed)) {
            currentBid = Math.round(parsed * 100); // Convert dollars to cents
          }
        } else {
          // Check for simple dollar amount: "$81,865.38"
          const simpleMatch = prop.bidAmount.match(/^\$([0-9,]+\.?\d*)$/);
          if (simpleMatch) {
            const cleaned = simpleMatch[1].replace(/,/g, '');
            const parsed = parseFloat(cleaned);
            if (!isNaN(parsed)) {
              openingBid = Math.round(parsed * 100); // Convert dollars to cents
            }
          }
        }
      }

      // Extract city from CSZ
      let city: string | null = null;
      if (prop.propertyCsz) {
        const parts = prop.propertyCsz.split(',');
        if (parts.length > 0) {
          city = parts[0].trim();
        }
      }

      return {
        county: standardizeCountyName(prop.county),
        address: prop.propertyAddress,
        city,
        saleDate,
        saleStatus,
        openingBid,
        currentBid,
        upsetBidCloseDate,
        caseNumber: prop.caseNo,
        source: 'hutchens',
        sourceType: 'hutchens',
        sourceUrl: 'https://sales.hutchenslawfirm.com/NCfcSalesList.aspx',
        rawData: JSON.stringify(prop)
      };
    });

    await browser.close();
    return transformedProperties;

  } catch (error) {
    console.error('Error scraping Hutchens Law Firm:', error);
    await browser.close();
    throw error;
  }
}

// Run directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeHutchens()
    .then(properties => {
      console.log('\n=== Hutchens Law Firm Scraper Results ===');
      console.log(`Total properties found: ${properties.length}`);
      console.log('\nSample properties:');
      properties.slice(0, 5).forEach(prop => {
        console.log(`- ${prop.county}: ${prop.address}, Sale: ${prop.saleDate}, Bid: $${prop.openingBid}`);
      });
    })
    .catch(error => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
