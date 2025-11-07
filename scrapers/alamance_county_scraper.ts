import puppeteer from 'puppeteer';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeAlamance(): Promise<PropertyData[]> {
  console.log('Starting Alamance County scraper...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://tax.alamancecountync.gov/home-1/tax-foreclosures/future-sales/', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('Page loaded, extracting properties...');

    // Extract property data from the page
    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // The page has numbered list items with property information
      const listItems = document.querySelectorAll('ol li');
      
      listItems.forEach((li) => {
        const text = li.textContent?.trim() || '';
        
        // Extract case name (e.g., "Alamance County vs. Hattie M. Miles, Heirs")
        const caseMatch = text.match(/Alamance County vs\.\s+([^:]+)/);
        const owner = caseMatch ? caseMatch[1].trim() : null;
        
        // Extract property description
        const descMatch = text.match(/:\s*([\s\S]+?)(?:Parcel|$)/);
        const description = descMatch ? descMatch[1].trim() : null;
        
        // Extract all parcel IDs (there can be multiple)
        const parcelRegex = /Parcel\s+ID#?'?s?\s*([#\d,\s]+)/gi;
        const parcelIds: string[] = [];
        let parcelMatch;
        while ((parcelMatch = parcelRegex.exec(text)) !== null) {
          const ids = parcelMatch[1].split(/[,\s]+/).filter((id: string) => id && id !== '#');
          parcelIds.push(...ids);
        }
        
        if (owner && (parcelIds.length > 0 || description)) {
          results.push({
            owner,
            description,
            parcelIds,
            county: 'Alamance',
          });
        }
      });
      
      return results;
    });

    console.log(`Found ${properties.length} properties in Alamance County`);

    // Transform to standard format
    // Note: Some properties have multiple parcels, we'll create separate entries for each
    const scrapedProperties: PropertyData[] = [];
    
    for (const prop of properties) {
      if (prop.parcelIds && prop.parcelIds.length > 0) {
        // Create an entry for each parcel ID
        for (const parcelId of prop.parcelIds) {
          scrapedProperties.push({
            county: standardizeCountyName('Alamance'),
            address: prop.description || null,
            parcelId: parcelId || null,
            saleDate: null, // Sale date is mentioned on main page but not in individual listings
            saleTime: null,
            saleStatus: 'scheduled',
            openingBid: null,
            currentBid: null,
            upsetBidCloseDate: null,
            propertyType: null,
            caseNumber: null,
            source: 'alamance_county',
            sourceType: 'county_website',
            sourceUrl: 'https://tax.alamancecountync.gov/home-1/tax-foreclosures/future-sales/',
            rawData: JSON.stringify(prop),
          });
        }
      } else {
        // No parcel ID, just use description
        scrapedProperties.push({
          county: 'Alamance',
          address: prop.description || null,
          parcelId: null,
          saleDate: null,
          saleTime: null,
          saleStatus: 'scheduled',
          openingBid: null,
          currentBid: null,
          upsetBidCloseDate: null,
          propertyType: null,
          caseNumber: null,
          source: 'alamance_county',
        sourceType: 'county_website',
          sourceUrl: 'https://tax.alamancecountync.gov/home-1/tax-foreclosures/future-sales/',
          rawData: JSON.stringify(prop),
        });
      }
    }

    return scrapedProperties;
  } catch (error) {
    console.error('Error scraping Alamance County:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Test the scraper if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeAlamance()
    .then((properties) => {
      console.log(JSON.stringify(properties, null, 2));
    })
    .catch((error) => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
