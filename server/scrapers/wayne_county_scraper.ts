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
  sourceType?: string | null;
  sourceUrl?: string | null;
  rawData?: string | null;
}

export async function scrapeWayneCounty(): Promise<PropertyData[]> {
  const mainUrl = 'https://www.waynegov.com/784/Tax-Foreclosure-Sales';
  
  try {
    // First, get the main page to find links to individual sale notices
    const mainResponse = await fetch(mainUrl);
    if (!mainResponse.ok) {
      throw new Error(`HTTP error! status: ${mainResponse.status}`);
    }
    
    const mainHtml = await mainResponse.text();
    const $ = cheerio.load(mainHtml);
    const properties: PropertyData[] = [];
    
    // Find all "News Flash" links for tax foreclosure sales
    const saleLinks: string[] = [];
    $('a').each((_index, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim();
      
      // Look for links to tax foreclosure sale notices
      if (href && text.toLowerCase().includes('tax foreclosure sale')) {
        const fullUrl = href.startsWith('http') ? href : `https://www.waynegov.com${href}`;
        if (!saleLinks.includes(fullUrl)) {
          saleLinks.push(fullUrl);
        }
      }
    });
    
    // Limit to the 3 most recent sales to avoid overwhelming the system
    const recentSaleLinks = saleLinks.slice(0, 3);
    
    // Fetch each sale notice and parse properties
    for (const saleUrl of recentSaleLinks) {
      try {
        const saleResponse = await fetch(saleUrl);
        if (!saleResponse.ok) continue;
        
        const saleHtml = await saleResponse.text();
        const $sale = cheerio.load(saleHtml);
        
        // Extract sale date from the page title or content
        const pageTitle = $sale('h1, h2, h3').first().text().trim();
        const saleDateMatch = pageTitle.match(/([A-Za-z]+\s+\d{1,2},\s+\d{4})/);
        const saleDate = saleDateMatch ? saleDateMatch[1] : undefined;
        
        // Find property information in the content
        // Wayne County lists properties as "Tract 1:", "Tract 2:", etc.
        const content = $sale('.fr-view, #ctl00_ctl00_ctl00_ContentPlaceHolderDefault_contentplaceholder_contentplaceholder_lblBody').html() || $sale('body').html() || '';
        
        // Parse tracts using exec instead of matchAll for better compatibility
        const tractRegex = /Tract\s+\d+:?\s*(?:<[^>]+>)*\s*Located at:?\s*(?:<[^>]+>)*\s*([^<\n]+?)(?:<[^>]+>)*\s*Parcel:?\s*(?:<[^>]+>)*\s*(\d+)(?:<[^>]+>)*.*?OPENING BID:\s*\$?([\d,]+\.?\d*)/gi;
        
        let match;
        while ((match = tractRegex.exec(content)) !== null) {
          const address = match[1].trim().replace(/\s+/g, ' ');
          const parcelId = match[2].trim();
          const bidStr = match[3].trim();
          
          // Parse opening bid to number
          const bidAmount = parseFloat(bidStr.replace(/,/g, ''));
          
          // Parse sale date to Date object
          let saleDateObj: Date | null = null;
          if (saleDate) {
            try {
              saleDateObj = new Date(saleDate);
              if (isNaN(saleDateObj.getTime())) saleDateObj = null;
            } catch (e) {
              saleDateObj = null;
            }
          }
          
          properties.push({
            county: 'Wayne',
            address: address || null,
            parcelId: parcelId || null,
            saleDate: saleDateObj,
            openingBid: isNaN(bidAmount) ? null : bidAmount,
            rawData: JSON.stringify({ 
              tract: match[0].substring(0, 200),
              saleUrl 
            }),
            source: 'Wayne County',
            sourceType: 'county_website',
            sourceUrl: 'https://www.waynegov.com/784/Tax-Foreclosure-Sales'
          });
        }
      } catch (error) {
        console.error(`[WayneCountyScraper] Error fetching sale ${saleUrl}:`, error);
        // Continue with other sales
      }
    }
    
    return properties;
  } catch (error) {
    console.error('[WayneCountyScraper] Error:', error);
    throw error;
  }
}
