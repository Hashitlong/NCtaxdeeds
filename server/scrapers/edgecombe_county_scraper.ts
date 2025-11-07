/**
 * Edgecombe County Tax Foreclosure Scraper
 * URL: https://www.edgecombecountync.gov/businesses/tax_collector/tax_foreclosure_list.php
 * Format: Simple HTML table with Address, Township, Parcel ID, Status, File Number
 */

import * as cheerio from 'cheerio';

interface ScrapedProperty {
  county: string;
  address?: string;
  parcelId?: string;
  saleDate?: Date;
  status?: string;
  fileNumber?: string;
  source: string;
  sourceUrl: string;
  scrapedAt: Date;
  rawData?: string;
}

export async function scrapeEdgecombe(): Promise<ScrapedProperty[]> {
  const url = 'https://www.edgecombecountync.gov/businesses/tax_collector/tax_foreclosure_list.php';
  const county = 'Edgecombe';
  
  console.log(`[EdgecombeCountyScraper] Starting scrape for ${county} County`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    // Find the table with foreclosure listings
    // The table has headers: Address, Township, Parcel ID, Status, File Number
    $('table tr').each((index: number, element: any) => {
      // Skip header row
      if (index === 0) return;

      const cells = $(element).find('td');
      if (cells.length < 4) return; // Need at least 4 columns

      const address = $(cells[0]).text().trim();
      const township = $(cells[1]).text().trim();
      const parcelId = $(cells[2]).text().trim();
      const status = $(cells[3]).text().trim();
      const fileNumber = cells.length > 4 ? $(cells[4]).text().trim() : '';

      // Skip if no address or if it's a header/footer row
      if (!address || address === '' || address.includes('PROPERTY DESCRIP') || address.includes('LAST UPDATED')) return;

      // Parse sale date from status field
      // Status examples: "Sale 11/19/2025", "Hearing Continued 12/1/2025"
      let saleDate: Date | undefined;
      const dateMatch = status.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateMatch) {
        saleDate = new Date(dateMatch[1]);
      }

      const property: ScrapedProperty = {
        county: county,
        parcelId: parcelId || undefined,
        address: address,
        saleDate: saleDate,
        status: status || undefined,
        fileNumber: fileNumber || undefined,
        source: 'Edgecombe County',
        sourceUrl: url,
        scrapedAt: new Date(),
        rawData: JSON.stringify({
          township,
          statusText: status,
        }),
      };

      properties.push(property);
    });

    console.log(`[EdgecombeCountyScraper] Found ${properties.length} properties`);
    return properties;
  } catch (error) {
    console.error(`[EdgecombeCountyScraper] Error scraping:`, error);
    throw error;
  }
}
