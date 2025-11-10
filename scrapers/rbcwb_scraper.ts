import puppeteer from 'puppeteer';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

/**
 * Scraper for Ruff, Bond, Cobb, Wade & Bethune (RBCWB) law firm
 * Handles tax foreclosures for Mecklenburg County
 * URL: https://www.rbcwb.com/tax-foreclosure-listings/
 */
export async function scrapeRBCWB(): Promise<PropertyData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    console.log('Starting RBCWB scraper...');
    const page = await browser.newPage();
    
    await page.goto('https://www.rbcwb.com/tax-foreclosure-listings/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('[RBCWB] Page loaded, waiting for content...');
    
    // Wait for table to load with multiple strategies
    await Promise.race([
      page.waitForSelector('table', { timeout: 10000 }),
      page.waitForSelector('table tr', { timeout: 10000 }),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]).catch(() => {
      console.log('[RBCWB] Table selector timeout, continuing anyway');
    });
    
    // Give extra time for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // Find ALL tables and try each one
      const tables = document.querySelectorAll('table');
      console.log(`[RBCWB] Found ${tables.length} tables on page`);
      
      let rowsFound = 0;
      tables.forEach((table, tableIndex) => {
        const rows = table.querySelectorAll('tr');
        console.log(`[RBCWB] Table ${tableIndex + 1} has ${rows.length} rows`);
        rowsFound += rows.length;
      });
      
      // Use the table with the most rows (likely the data table)
      const rows = document.querySelectorAll('table tr');
      console.log(`[RBCWB] Processing ${rows.length} total rows`);
      
      rows.forEach((row, index) => {
        // Skip header row
        if (index === 0) return;
        
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;
        
        const name = cells[0]?.textContent?.trim() || '';
        const address = cells[1]?.textContent?.trim() || '';
        const zipCode = cells[2]?.textContent?.trim() || '';
        const parcelId = cells[3]?.textContent?.trim() || '';
        const courtFile = cells[4]?.textContent?.trim() || '';
        const status = cells[5]?.textContent?.trim() || '';
        const upsetBidCloseDate = cells[6]?.textContent?.trim() || '';
        
        // Parse status to extract sale date and opening bid
        let saleDate = null;
        let openingBid = null;
        let currentBid = null;
        let saleStatus = 'pending';
        
        if (status) {
          // Extract sale date (e.g., "Tuesday, November 18, 2025")
          const saleDateMatch = status.match(/(?:Tuesday|Monday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/);
          if (saleDateMatch) {
            saleDate = saleDateMatch[1];
            saleStatus = 'scheduled';
          }
          
          // Extract opening bid (e.g., "Opening Bid $25,000.00")
          const openingBidMatch = status.match(/Opening Bid \$([0-9,]+\.?\d*)/);
          if (openingBidMatch) {
            openingBid = openingBidMatch[1].replace(/,/g, '');
          }
          
          // Extract current bid (e.g., "Current Bid $9,250.00")
          const currentBidMatch = status.match(/Current Bid \$([0-9,]+\.?\d*)/);
          if (currentBidMatch) {
            currentBid = currentBidMatch[1].replace(/,/g, '');
            // Current bid indicates property may be in upset period
            // Check if upset deadline has passed
            if (upsetBidCloseDate) {
              const now = new Date();
              const deadlineDate = new Date(upsetBidCloseDate);
              if (now <= deadlineDate) {
                saleStatus = 'in_upset_period';
              } else {
                saleStatus = 'sold'; // Upset period ended
              }
            } else {
              // No deadline info, assume in upset period
              saleStatus = 'in_upset_period';
            }
          }
          
          if (status.toLowerCase().includes('no sale date set')) {
            saleStatus = 'pending';
          }
          
          if (status.toLowerCase().includes('postponed')) {
            saleStatus = 'postponed';
          }
        }
        
        results.push({
          name,
          address,
          zipCode,
          parcelId,
          courtFile,
          status: saleStatus,
          saleDate,
          openingBid,
          currentBid,
          upsetBidCloseDate,
        });
      });
      
      console.log(`[RBCWB] Extracted ${results.length} properties from page`);
      return results;
    });

    console.log(`[RBCWB] Found ${properties.length} properties total`);

    // Convert to PropertyData format
    const propertyData: PropertyData[] = properties.map((prop: any) => ({
      county: standardizeCountyName('Mecklenburg'),
      parcelId: prop.parcelId,
      address: prop.address,
      city: null,
      saleDate: prop.saleDate ? new Date(prop.saleDate) : null,
      saleTime: null,
      saleStatus: prop.status,
      saleLocation: 'Mecklenburg County Courthouse, 832 East 4th Street, Charlotte, NC',
      openingBid: prop.openingBid ? parseFloat(prop.openingBid) : null, // Already in dollars
      currentBid: prop.currentBid ? parseFloat(prop.currentBid) : null,
      upsetBidCloseDate: prop.upsetBidCloseDate ? new Date(prop.upsetBidCloseDate) : null,
      propertyType: null,
      legalDescription: null,
      owner: prop.name,
      caseNumber: prop.courtFile,
      source: 'rbcwb',
      sourceType: 'rbcwb',
          sourceUrl: 'https://www.rbcwb.com/tax-foreclosure-listings/',
      rawData: JSON.stringify(prop),
    }));

    await browser.close();
    return propertyData;
  } catch (error) {
    console.error('Error scraping RBCWB:', error);
    await browser.close();
    throw error;
  }
}

// Run directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeRBCWB()
    .then(properties => {
      console.log('\n=== RBCWB Scraper Results ===');
      console.log(`Total properties found: ${properties.length}`);
      console.log('\nSample properties:');
      properties.slice(0, 5).forEach(prop => {
        console.log(`- ${prop.address}, Parcel: ${prop.parcelId}, Status: ${prop.saleStatus}, Bid: $${prop.openingBid ? (prop.openingBid / 100).toFixed(2) : 'N/A'}`);
      });
    })
    .catch(error => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
