/**
 * Hoke County Tax Foreclosure Scraper
 * URL: https://www.hokecounty.net/487/Upcoming-Foreclosure-Sales
 * Format: Two HTML tables - Upcoming Sales + Upset Bid Period
 * Fields: Parcel Number, Acreage, Location, Sale Date, Time, Opening Bid, Case Number
 */

import * as cheerio from 'cheerio';

interface ScrapedProperty {
  county: string;
  address?: string;
  parcelId?: string;
  saleDate?: Date;
  saleTime?: string;
  openingBid?: number;
  caseNumber?: string;
  status?: string;
  currentBid?: number;
  upsetBidCloseDate?: Date;
  source: string;
  sourceUrl: string;
  scrapedAt: Date;
  rawData?: string;
}

export async function scrapeHoke(): Promise<ScrapedProperty[]> {
  const url = 'https://www.hokecounty.net/487/Upcoming-Foreclosure-Sales';
  const county = 'Hoke';
  
  console.log(`[HokeCountyScraper] Starting scrape for ${county} County`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const properties: ScrapedProperty[] = [];

    // Find all tables on the page
    const tables = $('table');
    
    // First table: Upcoming Foreclosure Sales
    // Headers: Parcel Number, Acreage, Location, Sale Date, Time, Opening Bid, Case Number
    if (tables.length > 0) {
      $(tables[0]).find('tr').each((index: number, element: any) => {
        // Skip header row
        if (index === 0) return;

        const cells = $(element).find('td');
        if (cells.length < 6) return; // Need at least 6 columns

        // Extract parcel number(s) - may have multiple links
        const parcelLinks = $(cells[0]).find('a');
        const parcelIds: string[] = [];
        parcelLinks.each((i: number, link: any) => {
          const parcelId = $(link).text().trim();
          if (parcelId) parcelIds.push(parcelId);
        });
        const parcelId = parcelIds.join(', ');

        const acreage = $(cells[1]).text().trim();
        const location = $(cells[2]).text().trim();
        const saleDateText = $(cells[3]).text().trim();
        const saleTime = $(cells[4]).text().trim();
        const openingBidText = $(cells[5]).text().trim();
        const caseNumber = cells.length > 6 ? $(cells[6]).text().trim() : '';

        // Skip if no location
        if (!location || location === '') return;

        // Parse sale date
        let saleDate: Date | undefined;
        if (saleDateText && saleDateText !== 'TBD' && saleDateText !== 'POSTPONED') {
          // Format: "NOV 13, 2025" or "AUG 28, 2025"
          saleDate = new Date(saleDateText);
        }

        // Parse opening bid
        let openingBid: number | undefined;
        if (openingBidText && openingBidText !== 'TBD') {
          const bidMatch = openingBidText.match(/\$?([\d,]+\.?\d*)/);
          if (bidMatch) {
            openingBid = parseFloat(bidMatch[1].replace(/,/g, ''));
          }
        }

        // Determine status
        let status = 'Upcoming Sale';
        if (saleDateText === 'POSTPONED') {
          status = 'Postponed';
        } else if (saleDateText === 'TBD') {
          status = 'Sale Date TBD';
        }

        const property: ScrapedProperty = {
          county: county,
          parcelId: parcelId || undefined,
          address: location,
          saleDate: saleDate,
          saleTime: saleTime || undefined,
          openingBid: openingBid,
          caseNumber: caseNumber || undefined,
          status: status,
          source: 'Hoke County',
          sourceUrl: url,
          scrapedAt: new Date(),
          rawData: JSON.stringify({
            acreage,
            saleDateText,
            openingBidText,
          }),
        };

        properties.push(property);
      });
    }

    // Second table: Properties in Upset Bid Period
    // Headers: Parcel Number, Acreage, Location, Sale Date, Bid Upset Period Ends, Bid Received, Case Number
    if (tables.length > 1) {
      $(tables[1]).find('tr').each((index: number, element: any) => {
        // Skip header row
        if (index === 0) return;

        const cells = $(element).find('td');
        if (cells.length < 6) return;

        // Extract parcel number(s)
        const parcelLinks = $(cells[0]).find('a');
        const parcelIds: string[] = [];
        parcelLinks.each((i: number, link: any) => {
          const parcelId = $(link).text().trim();
          if (parcelId) parcelIds.push(parcelId);
        });
        const parcelId = parcelIds.join(', ');

        const acreage = $(cells[1]).text().trim();
        const location = $(cells[2]).text().trim();
        const saleDateText = $(cells[3]).text().trim();
        const upsetBidCloseDateText = $(cells[4]).text().trim();
        const currentBidText = $(cells[5]).text().trim();
        const caseNumber = cells.length > 6 ? $(cells[6]).text().trim() : '';

        // Skip if no location
        if (!location || location === '') return;

        // Parse dates
        let saleDate: Date | undefined;
        if (saleDateText) {
          saleDate = new Date(saleDateText);
        }

        let upsetBidCloseDate: Date | undefined;
        if (upsetBidCloseDateText) {
          upsetBidCloseDate = new Date(upsetBidCloseDateText);
        }

        // Parse current bid
        let currentBid: number | undefined;
        if (currentBidText) {
          const bidMatch = currentBidText.match(/\$?([\d,]+\.?\d*)/);
          if (bidMatch) {
            currentBid = parseFloat(bidMatch[1].replace(/,/g, ''));
          }
        }

        // Determine status based on upset deadline
        const now = new Date();
        let status = 'Upset Bid Period';
        if (upsetBidCloseDate && now > upsetBidCloseDate) {
          // Upset period has ended
          status = 'Sold';
        } else if (upsetBidCloseDate && now <= upsetBidCloseDate) {
          // Still in upset period
          status = 'Upset Bid Period';
        } else if (saleDate && saleDate > now) {
          // Future sale
          status = 'Upcoming Sale';
        }

        const property: ScrapedProperty = {
          county: county,
          parcelId: parcelId || undefined,
          address: location,
          saleDate: saleDate,
          currentBid: currentBid,
          upsetBidCloseDate: upsetBidCloseDate,
          caseNumber: caseNumber || undefined,
          status: status,
             source: 'Hoke County',
        sourceUrl: url,
          scrapedAt: new Date(),
          rawData: JSON.stringify({
            acreage,
            saleDateText,
            upsetBidCloseDateText,
            currentBidText,
          }),
        };

        properties.push(property);
      });
    }

    console.log(`[HokeCountyScraper] Found ${properties.length} properties`);
    return properties;
  } catch (error) {
    console.error(`[HokeCountyScraper] Error scraping:`, error);
    throw error;
  }
}
