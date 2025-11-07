import axios from 'axios';
import * as cheerio from 'cheerio';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

const CUMBERLAND_URL = 'https://www.cumberlandcountync.gov/departments/tax-group/tax/tax-foreclosure-sales';

export async function scrapeCumberlandCounty(): Promise<PropertyData[]> {
  console.log('[Cumberland] Starting scrape...');
  
  try {
    const response = await axios.get(CUMBERLAND_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const properties: PropertyData[] = [];

    // Find the table with foreclosure listings
    // Table structure: Owners Name | Property Location | Parcel Number | Bill Number | Sale Date
    const rows = $('table tr').slice(1); // Skip header row
    
    console.log(`[Cumberland] Found ${rows.length} table rows`);

    rows.each((_, row) => {
      const cells = $(row).find('td');
      
      if (cells.length < 5) {
        return; // Skip rows without enough data
      }

      const ownerName = $(cells[0]).text().trim().replace(/\s+/g, ' ');
      const propertyLocation = $(cells[1]).text().trim();
      const parcelNumber = $(cells[2]).text().trim();
      const billNumber = $(cells[3]).text().trim();
      const saleDateText = $(cells[4]).text().trim();

      // Skip if this is the header row or empty rows
      if (!ownerName || !parcelNumber || ownerName.toLowerCase().includes('owners name') || parcelNumber.toLowerCase().includes('parcel')) {
        return;
      }

      // Parse sale date
      let saleDate: Date | undefined;
      if (saleDateText && saleDateText !== 'TBD') {
        // Expected format: "Oct 30, 2025" or "Nov 20, 2025"
        const parsedDate = new Date(saleDateText);
        if (!isNaN(parsedDate.getTime())) {
          saleDate = parsedDate;
        }
      }

      // Determine status based on sale date
      let saleStatus: 'scheduled' | 'in_upset_period' | 'pending' | 'postponed' | 'sold' | 'cancelled' = 'pending';
      
      if (saleDate) {
        const now = new Date();
        if (saleDate > now) {
          saleStatus = 'scheduled';
        } else {
          // Sale date has passed
          // Cumberland County website doesn't show upset period info
          saleStatus = 'pending'; // Keep as pending since we don't know the actual status
        }
      }

      const property: PropertyData = {
        county: standardizeCountyName('Cumberland'),
        address: propertyLocation,
        parcelId: parcelNumber,
        saleDate: saleDate,
        saleStatus: saleStatus,
        owner: ownerName || undefined,
        source: 'Cumberland County',
        sourceType: 'county_website',
          sourceUrl: 'https://www.cumberlandcountync.gov/departments/tax-group/tax/tax-foreclosure-sales'
      };

      properties.push(property);
    });

    console.log(`[Cumberland] Successfully scraped ${properties.length} properties`);
    return properties;

  } catch (error) {
    console.error('[Cumberland] Scraping failed:', error);
    throw error;
  }
}
