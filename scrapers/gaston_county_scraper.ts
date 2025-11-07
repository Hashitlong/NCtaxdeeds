import puppeteer from 'puppeteer';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeGaston(): Promise<PropertyData[]> {
  console.log('Starting Gaston County scraper...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.gastongov.com/669/Tax-Foreclosure-Sales', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('Page loaded, extracting properties...');

    // Extract property data from the page
    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // The page has bullet lists with property information
      const listItems = document.querySelectorAll('ul li');
      
      let currentProperty: any = {};
      
      listItems.forEach((li) => {
        const text = li.textContent?.trim() || '';
        
        if (text.startsWith('Owner:')) {
          // Start a new property
          if (currentProperty.owner) {
            results.push(currentProperty);
          }
          currentProperty = {
            owner: text.replace('Owner:', '').trim(),
            county: 'Gaston',
          };
        } else if (text.startsWith('Parcel#:')) {
          currentProperty.parcelId = text.replace('Parcel#:', '').trim();
        } else if (text.startsWith('Physical Address:')) {
          currentProperty.address = text.replace('Physical Address:', '').trim();
        } else if (text.startsWith('Sale Date:')) {
          currentProperty.saleDateTime = text.replace('Sale Date:', '').trim();
        } else if (text.startsWith('Starting Bid')) {
          const bidMatch = text.match(/\$([\d,]+\.\d{2})/);
          if (bidMatch) {
            currentProperty.openingBid = bidMatch[1].replace(/,/g, '');
          }
        } else if (text.startsWith('File Number:')) {
          currentProperty.fileNumber = text.replace('File Number:', '').trim();
        }
      });
      
      // Don't forget the last property
      if (currentProperty.owner) {
        results.push(currentProperty);
      }
      
      return results;
    });

    console.log(`Found ${properties.length} properties in Gaston County`);

    // Transform to standard format
    const scrapedProperties: PropertyData[] = properties.map((prop) => {
      // Parse sale date and time
      let saleDate: Date | null = null;
      let saleTime: string | null = null;
      
      if (prop.saleDateTime) {
        // Format: "December 9, 2025, at 10 am"
        const dateMatch = prop.saleDateTime.match(/([A-Za-z]+\s+\d+,\s+\d{4})/);
        const timeMatch = prop.saleDateTime.match(/at\s+(\d+\s*[ap]m)/i);
        
        if (dateMatch) {
          try {
            saleDate = new Date(dateMatch[1]);
          } catch (e) {
            console.error('Error parsing date:', dateMatch[1]);
          }
        }
        if (timeMatch) {
          saleTime = timeMatch[1].replace(/\s+/g, '');
        }
      }
      
      return {
        county: standardizeCountyName('Gaston'),
        address: prop.address || null,
        parcelId: prop.parcelId || null,
        saleDate,
        saleTime,
        saleStatus: 'scheduled',
        openingBid: prop.openingBid ? parseFloat(prop.openingBid) : null,
        currentBid: null,
        upsetBidCloseDate: null,
        propertyType: null,
        caseNumber: prop.fileNumber || null,
        source: 'gaston_county',
        sourceType: 'county_website',
          sourceUrl: 'https://www.gastongov.com/669/Tax-Foreclosure-Sales',
        rawData: JSON.stringify(prop),
      };
    });

    return scrapedProperties;
  } catch (error) {
    console.error('Error scraping Gaston County:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Test the scraper if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeGaston()
    .then((properties) => {
      console.log(JSON.stringify(properties, null, 2));
    })
    .catch((error) => {
      console.error('Scraper failed:', error);
      process.exit(1);
    });
}
