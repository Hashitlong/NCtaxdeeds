import * as cheerio from 'cheerio';
import type { PropertyData } from './types';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export async function scrapeYadkinCounty(): Promise<PropertyData[]> {
  const url = 'https://www.yadkincountync.gov/384/Tax-Foreclosure-Sales';
  
  console.log('[Yadkin] Fetching:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Yadkin County: ${response.status}`);
  }
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const properties: PropertyData[] = [];
  
  // Get all the text content from the main content area
  const pageText = $('.fr-view').text() || $('body').text();
  
  // Split by "NOTICE OF TAX FORECLOSURE SALE" to get individual notices
  const noticeSections = pageText.split(/NOTICE OF TAX FORECLOSURE SALE/i).slice(1); // Skip first empty section
  
  console.log(`[Yadkin] Found ${noticeSections.length} notice sections`);
  
  noticeSections.forEach((fullText) => {
    try {
      
      // Extract opening bid
      const bidMatch = fullText.match(/Opening Bid:\s*\$?([\d,]+\.?\d*)/i);
      const openingBid = bidMatch ? parseFloat(bidMatch[1].replace(/,/g, '')) : undefined;
      
      // Extract sale date
      const saleDateMatch = fullText.match(/(\d{1,2})(?:st|nd|rd|th)?\s+day\s+of\s+(\w+),\s+(\d{4})/i);
      let saleDate: Date | undefined;
      if (saleDateMatch) {
        const [, day, month, year] = saleDateMatch;
        const monthMap: Record<string, number> = {
          'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
          'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
        };
        const monthNum = monthMap[month.toLowerCase()];
        if (monthNum !== undefined) {
          saleDate = new Date(parseInt(year), monthNum, parseInt(day), 12, 0, 0);
        }
      }
      
      // Extract parcel ID(s)
      const parcelMatches = fullText.match(/Parcel Identification Number:\s*(\d+)/gi);
      const parcelIds: string[] = [];
      if (parcelMatches) {
        parcelMatches.forEach(match => {
          const idMatch = match.match(/:\s*(\d+)/);
          if (idMatch) parcelIds.push(idMatch[1]);
        });
      }
      
      // Also check for "Multiple Parcels" at the beginning
      const multipleParcelMatch = fullText.match(/Multiple Parcels\s+([\d\s]+)/i);
      if (multipleParcelMatch) {
        const ids = multipleParcelMatch[1].trim().split(/\s+/);
        parcelIds.push(...ids);
      }
      
      // Extract township/location
      const townshipMatch = fullText.match(/lying and being in\s+([^,]+?)\s+Township/i);
      const township = townshipMatch ? townshipMatch[1].trim() : undefined;
      
      // Extract legal description (first paragraph after "described as follows:")
      const legalDescMatch = fullText.match(/described as follows:\s*([^]+?)(?:Subject to|The undersigned|This sale)/i);
      const legalDescription = legalDescMatch ? legalDescMatch[1].trim().substring(0, 500) : undefined;
      
      // Extract case number
      const caseMatch = fullText.match(/(\d{2}\s*CvD\s*\d+)/i);
      const caseNumber = caseMatch ? caseMatch[1].replace(/\s+/g, ' ') : undefined;
      
      // Extract property owner from case title
      const ownerMatch = fullText.match(/vs\.\s+([^,]+?)(?:,|\s+and\s+spouse)/i);
      const owner = ownerMatch ? ownerMatch[1].trim() : undefined;
      
      // Create property for each parcel ID found
      if (parcelIds.length > 0) {
        parcelIds.forEach(parcelId => {
          properties.push({
            county: standardizeCountyName('Yadkin'),
            parcelId: parcelId.trim(),
            openingBid,
            currentBid: openingBid,
            saleDate,
            saleStatus: 'scheduled',
            source: 'Yadkin County',
            sourceType: 'county_website',
            sourceUrl: 'https://www.yadkincountync.gov/384/Tax-Foreclosure-Sales',
            legalDescription,
            caseNumber,
            owner,
            address: township ? `${township} Township` : undefined,
          });
        });
      } else {
        // If no parcel IDs found, create one property with available info
        properties.push({
          county: standardizeCountyName('Yadkin'),
          parcelId: 'Unknown',
          openingBid,
          currentBid: openingBid,
          saleDate,
          saleStatus: 'scheduled',
            source: 'Yadkin County',
        sourceType: 'county_website',
          sourceUrl: 'https://www.yadkincountync.gov/384/Tax-Foreclosure-Sales',
            legalDescription,
            caseNumber,
            owner,
            address: township ? `${township} Township` : undefined
        });
      }
      
    } catch (error) {
      console.error('[Yadkin] Error parsing notice:', error);
    }
  });
  
  // Filter out properties without opening bids (incomplete data)
  const validProperties = properties.filter(p => p.openingBid !== undefined);
  
  console.log(`[Yadkin] Scraped ${validProperties.length} valid properties (${properties.length} total before filtering)`);
  
  return validProperties;
}
