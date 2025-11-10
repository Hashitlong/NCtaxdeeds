import puppeteer from 'puppeteer';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeRutherford(): Promise<PropertyData[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.rutherfordcountync.gov/departments/revenue_department_tax_administrator/foreclosure_sale_dates.php', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    const properties = await page.evaluate(() => {
      const results: any[] = [];
      const content = document.body.innerText;
      
      // Split by the asterisk separator lines
      const sections = content.split(/\*{50,}/);
      
      for (const section of sections) {
        if (!section.trim() || section.includes('PLEASE CONTACT') || section.includes('HOW TO UPSET')) {
          continue;
        }

        const property: any = {
          county: 'Rutherford',
          source: 'Rutherford County',
          sourceType: 'county_website',
          sourceUrl: 'https://www.rutherfordcountync.gov/departments/revenue_department_tax_administrator/foreclosure_sale_dates.php',
        };

        // Extract parcel ID
        const parcelMatch = section.match(/Parcel(?:\(s\))?\s*:\s*([0-9,\s\-\/]+)/i);
        if (parcelMatch) {
          // Take first parcel if multiple
          const parcels = parcelMatch[1].split(/[,\/]/).map(p => p.trim());
          property.parcelId = parcels[0].replace(/\s*-.*$/, ''); // Remove acreage info
        }

        // Extract file number
        const fileMatch = section.match(/FILE\s*#.*?:\s*([0-9\s]+[A-Z]+\s*[0-9]+)/i);
        if (fileMatch) {
          property.caseNumber = fileMatch[1].trim();
        }

        // Extract address
        const addressMatch = section.match(/(?:Parcel.*?\n.*?\n)([0-9]+.*?(?:Rd|St|Ave|Dr|Lane|Circle|Way|Parkway|Hwy|Place),\s*[A-Z][a-z]+)/i);
        if (addressMatch) {
          property.address = addressMatch[1].trim();
        } else {
          // Try to find "0 Street Name, City" format
          const zeroAddressMatch = section.match(/(0\s+[^,\n]+,\s*[A-Z][a-z]+)/);
          if (zeroAddressMatch) {
            property.address = zeroAddressMatch[1].trim();
          }
        }

        // Extract current bid
        const currentBidMatch = section.match(/Current\s+Bid\s*:\s*\$?([\d,]+\.?\d*)/i);
        if (currentBidMatch) {
          property.currentBid = parseFloat(currentBidMatch[1].replace(/,/g, ''));
        }

        // Extract minimum upset bid
        const minBidMatch = section.match(/Minimum\s+amount\s+needed\s+to\s+upset\s+bid\s*:\s*\$?([\d,]+\.?\d*)/i);
        if (minBidMatch) {
          property.openingBid = parseFloat(minBidMatch[1].replace(/,/g, ''));
        }

        // Extract last day to upset bid (this is the upset deadline)
        const upsetBidCloseDateMatch = section.match(/Last\s+day\s+to\s+upset\s+bid\s*:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i);
        if (upsetBidCloseDateMatch) {
          // Return as string to be parsed in Node.js context (Date objects don't serialize properly from page.evaluate)
          property.upsetBidCloseDateString = upsetBidCloseDateMatch[1];
          property.saleStatus = 'upset_period';
        }

        // Extract estimated sale date
        const saleDateMatch = section.match(/ESTIMATED\s+SALE\s+DATE\s*:\s*([^\n]+)/i);
        if (saleDateMatch) {
          const dateStr = saleDateMatch[1].trim();
          // For estimated dates like "Winter 2024/2025", set a placeholder
          if (dateStr.match(/\d{4}/)) {
            property.saleStatus = 'scheduled';
            // Don't set a specific date for estimated dates
          }
        }

        // Only add if we have at least parcel ID or address
        if (property.parcelId || property.address) {
          results.push(property as PropertyData);
        }
      }

      return results;
    });

    // Parse date strings into Date objects (can't create Date objects in page.evaluate context)
    const processedProperties = properties.map(prop => {
      if (prop.upsetBidCloseDateString) {
        const [month, day, year] = prop.upsetBidCloseDateString.split('/').map(Number);
        prop.upsetBidCloseDate = new Date(year, month - 1, day);
        delete prop.upsetBidCloseDateString;
      }
      return prop;
    });

    console.log(`Rutherford County: Found ${processedProperties.length} properties`);
    return processedProperties;

  } catch (error) {
    console.error('Error scraping Rutherford County:', error);
    return [];
  } finally {
    await browser.close();
  }
}
