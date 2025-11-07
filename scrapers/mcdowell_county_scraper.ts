import axios from 'axios';
import * as cheerio from 'cheerio';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

const MCDOWELL_URL = 'https://www.mcdowellgov.com/departments/tax-collections/tax-foreclosures/upcoming-tax-foreclosure-sales';

export async function scrapeMcDowellCounty(): Promise<PropertyData[]> {
  console.log('[McDowell] Starting scrape...');
  
  try {
    const response = await axios.get(MCDOWELL_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const properties: PropertyData[]= [];

    // Find all table rows (skip header rows)
    // Table structure: ORIGINAL SALE DATE | 10-DAY UPSET BID PERIOD ENDS | PARCEL NUMBER | HIGHEST BID RECORDED | FILE NUMBER
    const rows = $('table tr');
    
    console.log(`[McDowell] Found ${rows.length} table rows`);

    rows.each((_, row) => {
      const cells = $(row).find('td');
      
      if (cells.length < 5) {
        return; // Skip rows without enough data
      }

      const originalSaleDateText = $(cells[0]).text().trim();
      const upsetBidEndDateText = $(cells[1]).text().trim();
      const parcelNumber = $(cells[2]).text().trim();
      const highestBidText = $(cells[3]).text().trim();
      const fileNumber = $(cells[4]).text().trim();

      // Skip if this is a header row or empty
      if (!parcelNumber || parcelNumber.toLowerCase().includes('parcel')) {
        return;
      }

      // Parse dates
      let saleDate: Date | undefined;
      let upsetBidDeadline: Date | undefined;
      
      if (originalSaleDateText) {
        const parsedDate = new Date(originalSaleDateText);
        if (!isNaN(parsedDate.getTime())) {
          saleDate = parsedDate;
        }
      }

      if (upsetBidEndDateText) {
        const parsedDate = new Date(upsetBidEndDateText);
        if (!isNaN(parsedDate.getTime())) {
          upsetBidDeadline = parsedDate;
        }
      }

      // Parse bid amount
      let minimumBid: number | undefined;
      if (highestBidText) {
        const bidMatch = highestBidText.match(/[\d,]+\.?\d*/);
        if (bidMatch) {
          minimumBid = parseFloat(bidMatch[0].replace(/,/g, ''));
        }
      }

      // Determine status based on dates
      let saleStatus: 'scheduled' | 'in_upset_period' | 'pending' | 'postponed' | 'sold' | 'cancelled' = 'pending';
      
      if (saleDate && upsetBidDeadline) {
        const now = new Date();
        if (now < saleDate) {
          saleStatus = 'scheduled';
        } else if (now >= saleDate && now <= upsetBidDeadline) {
          saleStatus = 'in_upset_period';
        } else if (now > upsetBidDeadline) {
          saleStatus = 'sold'; // Upset period ended
        }
      }

      const property: PropertyData = {
        county: standardizeCountyName('McDowell'),
        address: `Parcel ${parcelNumber}`, // No address in table, use parcel as placeholder
        parcelId: parcelNumber,
        saleDate: saleDate,
        upsetBidCloseDate: upsetBidDeadline,
        openingBid: minimumBid,
        saleStatus: saleStatus,
        owner: undefined, // No owner in table
        source: 'McDowell County',
        sourceType: 'county_website',
        sourceUrl: 'https://www.mcdowellgov.com/departments/tax-collections/tax-foreclosures/upcoming-tax-foreclosure-sales',
        caseNumber: fileNumber || undefined
      };

      properties.push(property);
    });

    console.log(`[McDowell] Successfully scraped ${properties.length} properties`);
    return properties;

  } catch (error) {
    console.error('[McDowell] Scraping failed:', error);
    throw error;
  }
}
