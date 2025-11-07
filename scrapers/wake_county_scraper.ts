import puppeteer from 'puppeteer';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

/**
 * Scraper for Wake County tax foreclosure properties
 * URL: https://www.wake.gov/departments-government/tax-administration/real-estate/foreclosures
 */
export async function scrapeWakeCounty(): Promise<PropertyData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    console.log('Starting Wake County scraper...');
    const page = await browser.newPage();
    
    await page.goto('https://www.wake.gov/departments-government/tax-administration/real-estate/foreclosures', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('Page loaded, extracting property data...');
    
    // Wait a moment for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract all property parcel links
    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // Find all parcel ID links - they are in the format of numbers like "0120092"
      const parcelLinks = Array.from(document.querySelectorAll('a[href*="realestate.wake.gov"]'));
      
      parcelLinks.forEach((link: any) => {
        const parcelId = link.textContent?.trim();
        const href = link.href;
        
        if (parcelId && /^\d{7}$/.test(parcelId)) {
          // Try to find property details near this link
          let parent = link.closest('tr, div, section');
          let address = '';
          let saleDate = '';
          let taxAmount = '';
          
          // Look for address and other details in the parent element
          if (parent) {
            const text = parent.textContent || '';
            
            // Try to extract address (usually contains street names)
            const addressMatch = text.match(/\d+\s+[A-Z][A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Ct|Court|Way|Blvd|Boulevard)/i);
            if (addressMatch) {
              address = addressMatch[0].trim();
            }
            
            // Try to extract tax amount (usually has $ or "Tax Lien")
            const taxMatch = text.match(/\$[\d,]+\.?\d*/);
            if (taxMatch) {
              taxAmount = taxMatch[0].replace(/[$,]/g, '');
            }
            
            // Try to extract sale date
            const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
            if (dateMatch) {
              saleDate = dateMatch[0];
            }
          }
          
          results.push({
            parcelId,
            address: address || null,
            href,
            taxAmount: taxAmount || null,
            saleDate: saleDate || null,
          });
        }
      });
      
      return results;
    });

    console.log(`Found ${properties.length} properties from Wake County`);

    // Convert to PropertyData format
    const propertyData: PropertyData[] = properties.map((prop: any) => ({
      county: standardizeCountyName('Wake'),
      parcelId: prop.parcelId,
      address: prop.address,
      city: null,
      saleDate: prop.saleDate ? new Date(prop.saleDate) : null,
      saleTime: null,
      saleStatus: 'scheduled',
      saleLocation: 'Wake County Courthouse, Salisbury Street entrance',
      openingBid: prop.taxAmount ? parseFloat(prop.taxAmount) * 100 : null, // Convert to cents
      currentBid: null,
      upsetBidCloseDate: null,
      propertyType: null,
      legalDescription: null,
      owner: null,
      caseNumber: null,
      source: 'wake_county',
        sourceType: 'county_website',
          sourceUrl: 'https://www.wake.gov/departments-government/tax-administration/real-estate/foreclosures',
      rawData: JSON.stringify(prop),
    }));

    await browser.close();
    return propertyData;
  } catch (error) {
    console.error('Error scraping Wake County:', error);
    await browser.close();
    throw error;
  }
}

// Run directly if called from command line
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeWakeCounty()
    .then(properties => {
      console.log('\n=== Wake County Scraper Results ===');
      console.log(`Total properties found: ${properties.length}`);
      console.log('\nSample properties:');
      properties.slice(0, 5).forEach(prop => {
        console.log(`- Parcel: ${prop.parcelId}, Address: ${prop.address || 'N/A'}, Sale: ${prop.saleDate || 'N/A'}, Amount: $${prop.openingBid ? (prop.openingBid / 100).toFixed(2) : 'N/A'}`);
      });
    })
    .catch(error => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
