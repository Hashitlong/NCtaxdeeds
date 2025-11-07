import puppeteer from 'puppeteer';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeForsyth(): Promise<PropertyData[]> {
  console.log('Starting Forsyth County scraper...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.forsyth.cc/tax/foreclosure_prop.aspx', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    console.log('Page loaded, extracting properties...');

    // First, let's see what the actual HTML structure is
    const htmlStructure = await page.evaluate(() => {
      // Find all h4 elements (property addresses)
      const h4Elements = Array.from(document.querySelectorAll('h4'));
      console.log(`Found ${h4Elements.length} h4 elements`);
      
      // Try to find tables
      const tables = Array.from(document.querySelectorAll('table'));
      console.log(`Found ${tables.length} tables`);
      
      // Try to find any element containing "319 E 16TH ST"
      const allText = document.body.innerText;
      const has319 = allText.includes('319 E 16TH ST');
      console.log(`Page contains "319 E 16TH ST": ${has319}`);
      
      return {
        h4Count: h4Elements.length,
        tableCount: tables.length,
        has319
      };
    });
    
    console.log('HTML structure:', htmlStructure);

    // Extract property data from the page
    const properties = await page.evaluate(() => {
      const results: any[] = [];
      
      // The page has a specific structure - let's parse it differently
      // Look for all text content and parse it line by line
      const bodyText = document.body.innerText;
      const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);
      
      let currentProperty: any = null;
      let inPropertySection = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this line looks like an address (property heading)
        // Addresses typically have numbers and street names
        if (/^\d+\s+[A-Z]/.test(line) && line.includes('WINSTON SALEM') || line.includes('NC ')) {
          // Start a new property
          if (currentProperty && (currentProperty.parcelId || currentProperty.address)) {
            results.push(currentProperty);
          }
          currentProperty = {
            address: line,
            county: 'Forsyth',
          };
          inPropertySection = true;
          continue;
        }
        
        if (!inPropertySection) continue;
        
        // Parse property details
        if (line.startsWith('Case Number:')) {
          currentProperty.caseNumber = line.replace('Case Number:', '').trim();
        } else if (line.startsWith('Status:')) {
          currentProperty.status = line.replace('Status:', '').trim();
        } else if (line.startsWith('PIN:')) {
          currentProperty.parcelId = line.replace('PIN:', '').trim();
        } else if (line.startsWith('Tax Value:')) {
          currentProperty.taxValue = line.replace('Tax Value:', '').replace(/[$,]/g, '').trim();
        } else if (line.startsWith('Min Bid:')) {
          currentProperty.openingBid = line.replace('Min Bid:', '').replace(/[$,]/g, '').trim();
        } else if (line.startsWith('Owner:')) {
          currentProperty.owner = line.replace('Owner:', '').trim();
        } else if (line.startsWith('Sale Date & Time:')) {
          currentProperty.saleDateTime = line.replace('Sale Date & Time:', '').trim();
        } else if (line.startsWith('Attorney:')) {
          currentProperty.attorney = line.replace('Attorney:', '').trim();
        }
      }
      
      // Don't forget the last property
      if (currentProperty && (currentProperty.parcelId || currentProperty.address)) {
        results.push(currentProperty);
      }
      
      return results;
    });

    console.log(`Found ${properties.length} properties in Forsyth County`);

    // Transform to standard format
    const scrapedProperties: PropertyData[] = properties.map((prop) => {
      // Parse sale date and time
      let saleDate: Date | null = null;
      let saleTime = null;
      
      if (prop.saleDateTime) {
        // Format: "Aug 27 2025 : 12 00 PM" or similar
        const dateMatch = prop.saleDateTime.match(/([A-Za-z]+\s+\d+\s+\d{4})/);
        const timeMatch = prop.saleDateTime.match(/(\d+\s*:\s*\d+\s*[AP]M)/i);
        
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
      
      return {
        county: 'Forsyth',
        address: prop.address || null,
        parcelId: prop.parcelId || null,
        saleDate,
        saleTime,
        saleStatus,
        openingBid: prop.openingBid && prop.openingBid !== '$' ? parseFloat(prop.openingBid) : null,
        currentBid: null,
        upsetBidCloseDate: null,
        propertyType: null,
        caseNumber: prop.caseNumber || null,
        source: 'forsyth_county',
        sourceType: 'county_website',
          sourceUrl: 'https://www.forsyth.cc/tax/foreclosure_prop.aspx',
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
