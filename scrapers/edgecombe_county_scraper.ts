import axios from 'axios';
import * as cheerio from 'cheerio';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

const EDGECOMBE_URL = 'https://www.edgecombecountync.gov/businesses/tax_collector/tax_foreclosure_list.php';

export async function scrapeEdgecombeCounty(): Promise<PropertyData[]> {
  console.log('[Edgecombe] Starting scrape...');
  
  try {
    const response = await axios.get(EDGECOMBE_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const properties: PropertyData[] = [];

    // Find the table with foreclosure listings
    const rows = $('table tr').slice(1); // Skip header row
    
    console.log(`[Edgecombe] Found ${rows.length} table rows`);

    rows.each((_, row) => {
      const cells = $(row).find('td');
      
      if (cells.length < 5) {
        return; // Skip rows without enough data
      }

      const address = $(cells[0]).text().trim();
      const township = $(cells[1]).text().trim();
      const parcelId = $(cells[2]).text().trim();
      const statusText = $(cells[3]).text().trim();
      const fileNumber = $(cells[4]).text().trim();

      // Skip if this is the header row, "LAST UPDATED" row, or empty rows
      if (!address || address.includes('LAST UPDATED') || address.includes('PROPERTY DESCRIP') || !parcelId || parcelId === 'PARCEL') {
        return;
      }

      // Extract sale date from status if available
      let saleDate: Date | undefined;
      const saleDateMatch = statusText.match(/Sale\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (saleDateMatch) {
        saleDate = new Date(saleDateMatch[1]);
      }

      // Map status to our enum
      let saleStatus: 'scheduled' | 'in_upset_period' | 'pending' | 'postponed' | 'sold' | 'cancelled' = 'pending';
      const now = new Date();
      
      if (statusText.toLowerCase().includes('upset bid')) {
        // Property is in upset period
        saleStatus = 'in_upset_period';
      } else if (statusText.toLowerCase().includes('sale') && saleDate) {
        // Check if sale is in the future or past
        if (saleDate > now) {
          saleStatus = 'scheduled';
        } else {
          // Sale has passed
          saleStatus = 'pending'; // Don't assume sold without confirmation
        }
      } else if (statusText.toLowerCase().includes('continued') || statusText.toLowerCase().includes('hearing')) {
        saleStatus = 'postponed';
      } else if (statusText.toLowerCase().includes('private sale')) {
        saleStatus = 'pending';
      }

      const property: PropertyData = {
        county: standardizeCountyName('Edgecombe'),
        address: address,
        parcelId: parcelId,
        saleDate: saleDate,
        saleStatus: saleStatus,
        caseNumber: fileNumber || undefined,
        source: 'Edgecombe County',
        sourceType: 'county_website',
          sourceUrl: 'https://www.edgecombecountync.gov/businesses/tax_collector/tax_foreclosure_list.php'
      };

      properties.push(property);
    });

    console.log(`[Edgecombe] Successfully scraped ${properties.length} properties`);
    return properties;

  } catch (error) {
    console.error('[Edgecombe] Scraping failed:', error);
    throw error;
  }
}
