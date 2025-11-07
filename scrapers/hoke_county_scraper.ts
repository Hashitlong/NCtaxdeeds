import axios from 'axios';
import * as cheerio from 'cheerio';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

const HOKE_URL = 'https://www.hokecounty.net/487/Upcoming-Foreclosure-Sales';

export async function scrapeHokeCounty(): Promise<PropertyData[]> {
  console.log('[Hoke] Starting scrape...');
  
  try {
    const response = await axios.get(HOKE_URL, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const properties: PropertyData[] = [];

    // Find both tables on the page
    $('table').each((tableIndex, table) => {
      const rows = $(table).find('tr').slice(1); // Skip header row
      
      console.log(`[Hoke] Table ${tableIndex + 1}: Found ${rows.length} rows`);

      rows.each((_, row) => {
        const cells = $(row).find('td');
        
        if (cells.length < 6) {
          return; // Skip rows without enough data
        }

        // Handle multiple parcel numbers (links) in first cell
        const parcelLinks = $(cells[0]).find('a');
        const parcelNumbers: string[] = [];
        if (parcelLinks.length > 0) {
          parcelLinks.each((_, link) => {
            const parcelText = $(link).text().trim();
            if (parcelText) parcelNumbers.push(parcelText);
          });
        }
        const parcelNumber = parcelNumbers.length > 0 ? parcelNumbers.join(', ') : $(cells[0]).text().trim();
        const acreage = $(cells[1]).text().trim();
        const location = $(cells[2]).text().trim();
        const saleDateText = $(cells[3]).text().trim();
        const timeText = $(cells[4]).text().trim();
        const openingBidText = $(cells[5]).text().trim();
        const caseNumber = cells.length > 6 ? $(cells[6]).text().trim() : undefined;

        // Skip if this is empty or invalid data
        if (!parcelNumber || !location || parcelNumber === 'Parcel Number') {
          return;
        }

        // Parse sale date
        let saleDate: Date | undefined;
        let saleStatus: 'scheduled' | 'in_upset_period' | 'pending' | 'postponed' = 'pending';
        
        if (saleDateText && saleDateText !== 'TBD') {
          if (saleDateText.toUpperCase() === 'POSTPONED') {
            saleStatus = 'postponed';
          } else {
            // Try to parse dates like "NOV 13, 2025" or "AUG 28, 2025"
            const dateMatch = saleDateText.match(/([A-Z]+)\s+(\d{1,2}),\s+(\d{4})/i);
            if (dateMatch) {
              const [, month, day, year] = dateMatch;
              const monthMap: Record<string, number> = {
                'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
              };
              const monthNum = monthMap[month.toUpperCase()];
              if (monthNum !== undefined) {
                saleDate = new Date(parseInt(year), monthNum, parseInt(day), 10, 0, 0);
                saleStatus = 'scheduled';
              }
            }
          }
        }

        // Check if this is in upset bid period (second table)
        if (tableIndex === 1) {
          saleStatus = 'in_upset_period';
        }

        // Parse opening bid
        let openingBid: number | undefined;
        if (openingBidText && openingBidText !== 'TBD') {
          const bidMatch = openingBidText.match(/\$?([\d,]+\.?\d*)/);
          if (bidMatch) {
            openingBid = parseFloat(bidMatch[1].replace(/,/g, ''));
          }
        }

        // Parse upset deadline from column 4 in second table
        let upsetBidCloseDate: Date | undefined;
        if (tableIndex === 1 && cells.length > 4) {
          const upsetText = $(cells[4]).text().trim();
          const upsetMatch = upsetText.match(/([A-Z]+)\s+(\d{1,2}),\s+(\d{4})/i);
          if (upsetMatch) {
            const [, month, day, year] = upsetMatch;
            const monthMap: Record<string, number> = {
              'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
              'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
            };
            const monthNum = monthMap[month.toUpperCase()];
            if (monthNum !== undefined) {
              upsetBidCloseDate = new Date(parseInt(year), monthNum, parseInt(day), 17, 0, 0);
            }
          }
        }

        // Get current bid from column 5 in second table
        let currentBid: number | undefined;
        if (tableIndex === 1 && cells.length > 5) {
          const bidText = $(cells[5]).text().trim();
          const bidMatch = bidText.match(/\$?([\d,]+\.?\d*)/);
          if (bidMatch) {
            currentBid = parseFloat(bidMatch[1].replace(/,/g, ''));
          }
        }

        const property: PropertyData = {
          county: standardizeCountyName('Hoke'),
          address: location,
          parcelId: parcelNumber,
          saleDate: saleDate,
          saleTime: timeText && timeText !== 'TBD' ? timeText : undefined,
          saleStatus: saleStatus,
          openingBid: openingBid,
          currentBid: currentBid,
          upsetBidCloseDate: upsetBidCloseDate,
          caseNumber: caseNumber && caseNumber !== 'TBD' ? caseNumber : undefined,
          source: 'Hoke County',
        sourceType: 'county_website',
          sourceUrl: HOKE_URL
        };

        properties.push(property);
      });
    });

    console.log(`[Hoke] Successfully scraped ${properties.length} properties`);
    return properties;

  } catch (error) {
    console.error('[Hoke] Scraping failed:', error);
    throw error;
  }
}
