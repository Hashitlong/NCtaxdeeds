import * as cheerio from 'cheerio';

interface PropertyData {
  county: string;
  address?: string | null;
  city?: string | null;
  parcelId?: string | null;
  saleDate?: Date | null;
  saleTime?: string | null;
  saleStatus?: string | null;
  saleLocation?: string | null;
  openingBid?: number | null;
  currentBid?: number | null;
  upsetBidCloseDate?: Date | null;
  propertyType?: string | null;
  legalDescription?: string | null;
  owner?: string | null;
  caseNumber?: string | null;
  source: string;
  rawData?: string | null;
}

export async function scrapeYadkinCounty(): Promise<PropertyData[]> {
  const url = 'https://www.yadkincountync.gov/384/Tax-Foreclosure-Sales';
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const properties: PropertyData[] = [];
    
    // Get the main content area - try multiple selectors
    let content = $('#ctl00_ctl00_ctl00_ContentPlaceHolderDefault_contentplaceholder_contentplaceholder_lblPageContent').html();
    if (!content) {
      content = $('.fr-view').html();
    }
    if (!content) {
      content = $('body').html();
    }
    if (!content) {
      console.warn('[YadkinCountyScraper] Could not find content');
      return [];
    }
    
    // Convert HTML to text for easier parsing
    const $content = cheerio.load(content);
    const textContent = $content.text();
    
    // Split content by "NOTICE OF TAX FORECLOSURE SALE" headers
    const notices = textContent.split(/NOTICE OF TAX FORECLOSURE SALE/i);
    
    // Skip the first split (before first notice)
    for (let i = 1; i < notices.length; i++) {
      const notice = notices[i];
      
      try {
        // Extract opening bid
        const bidMatch = notice.match(/Opening Bid:\s*\$?([\d,]+\.?\d*)/i);
        const openingBid = bidMatch ? parseFloat(bidMatch[1].replace(/,/g, '')) : null;
        
        // Extract parcel ID(s)
        const parcelMatch = notice.match(/Parcel Identification Number:\s*(\d+)/i) ||
                           notice.match(/Multiple Parcels\s+([\d\s]+)/i);
        let parcelId: string | null = null;
        if (parcelMatch) {
          parcelId = parcelMatch[1].trim().replace(/\s+/g, ', ');
        }
        
        // Extract sale date
        const saleDateMatch = notice.match(/on the (\d+)(?:st|nd|rd|th) day of ([A-Za-z]+),\s*(\d{4})/i);
        let saleDate: Date | null = null;
        if (saleDateMatch) {
          const day = saleDateMatch[1];
          const month = saleDateMatch[2];
          const year = saleDateMatch[3];
          try {
            saleDate = new Date(`${month} ${day}, ${year}`);
            if (isNaN(saleDate.getTime())) saleDate = null;
          } catch (e) {
            saleDate = null;
          }
        }
        
        // Extract case number
        const caseMatch = notice.match(/(\d+\s*CvD\s*\d+)/i);
        const caseNumber = caseMatch ? caseMatch[1].trim() : null;
        
        // Extract property description for address
        const descMatch = notice.match(/described as follows:\s*([\s\S]+?)(?:Subject to|The undersigned|Parcel Identification)/i);
        let legalDescription: string | null = null;
        let address: string | null = null;
        
        if (descMatch) {
          legalDescription = descMatch[1].trim().substring(0, 500); // Limit length
          
          // Try to extract a readable address from legal description
          const addressMatch = legalDescription.match(/(?:Being|Located at|fronting on)\s+([^;,\.]+(?:Street|Road|Drive|Lane|Avenue|Boulevard|Highway)[^;,\.]*)/i);
          if (addressMatch) {
            address = addressMatch[1].trim().substring(0, 200);
          }
        }
        
        // Extract township/location
        const townshipMatch = notice.match(/lying and being in ([^,]+Township)/i);
        const township = townshipMatch ? townshipMatch[1].trim() : null;
        
        // Only add if we have at least opening bid and parcel ID
        if (openingBid && parcelId) {
          properties.push({
            county: 'Yadkin',
            address: address || (township ? `Property in ${township}` : null),
            parcelId,
            saleDate,
            saleTime: '12:00 PM',
            saleLocation: 'Courthouse door, Yadkinville, NC',
            openingBid,
            legalDescription,
            caseNumber,
            rawData: JSON.stringify({ 
              noticeSnippet: notice.substring(0, 300)
            }),
            source: 'Yadkin County'
          });
        }
      } catch (error) {
        console.error('[YadkinCountyScraper] Error parsing notice:', error);
        // Continue with next notice
      }
    }
    
    return properties;
  } catch (error) {
    console.error('[YadkinCountyScraper] Error:', error);
    throw error;
  }
}
