/**
 * ZLS (Zacchaeus Legal Services) Scraper
 * Scrapes tax foreclosure listings from https://www.zls-nc.com/listings
 * Handles multiple counties across North Carolina
 */

import puppeteer from 'puppeteer';
import { parseNoticeText, type NoticeDetails } from './zls_notice_extractor';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

export interface ScrapedProperty {
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
  deedBookPage?: string | null;
  depositRequired?: string | null;
  noticeText?: string | null;
  source: string;
  sourceType?: string | null;
  sourceUrl?: string | null;
  rawData?: string | null;
}

/**
 * Map ZLS status strings to database enum values
 */
function mapZLSStatus(zlsStatus: string): string {
  const status = zlsStatus.toLowerCase();
  
  if (status.includes('upset')) return 'in_upset_period';
  if (status.includes('pending')) return 'pending';
  if (status.includes('upcoming') || status.includes('scheduled')) return 'scheduled';
  if (status.includes('sold') || status.includes('complete')) return 'sold';
  if (status.includes('cancel') || status.includes('postpone')) return 'cancelled';
  
  return 'scheduled'; // default
}

export async function scrapeZLS(options?: { extractNotices?: boolean; maxNotices?: number }): Promise<ScrapedProperty[]> {
  const { extractNotices = false, maxNotices = 50 } = options || {};
  console.log('[ZLS] Starting scrape of ZLS listings...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.zls-nc.com/listings', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for Blazor to initialize (Blazor Server app)
    console.log('[ZLS] Waiting for Blazor to initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Wait for disclaimer content to appear
    await page.waitForFunction(
      () => document.body.textContent?.includes('I AGREE'),
      { timeout: 30000 }
    );
    
    console.log('[ZLS] Disclaimer loaded, clicking I AGREE...');
    
    // Click I AGREE button using JavaScript evaluation
    const clicked = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const agreeLink = links.find(el => el.textContent?.trim() === 'I AGREE');
      if (agreeLink && agreeLink instanceof HTMLElement) {
        agreeLink.click();
        return true;
      }
      return false;
    });
    
    if (clicked) {
      console.log('[ZLS] Clicked I AGREE');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('[ZLS] Could not find I AGREE button');
    }

    // Wait for the listings table to load
    await page.waitForSelector('table', { timeout: 30000 });
    console.log('[ZLS] Table loaded');
    
    // Try to set page size to "All" to get all properties at once
    console.log('[ZLS] Attempting to set page size to All...');
    try {
      // Look for page size dropdown/combobox (usually in bottom right corner)
      const pageSizeChanged = await page.evaluate(() => {
        // Find elements that might be the page size selector
        const selectors = Array.from(document.querySelectorAll('select, button, div[role="combobox"], div[role="button"]'));
        
        // Look for one that contains page size text like "10", "25", "50", "All"
        for (const elem of selectors) {
          const text = elem.textContent || '';
          const ariaLabel = elem.getAttribute('aria-label') || '';
          
          // Check if this looks like a page size control
          if (text.match(/^\d+$/) || text.includes('items per page') ||
              ariaLabel.toLowerCase().includes('page size') ||
              ariaLabel.toLowerCase().includes('items per page')) {
            
            // Try to click it to open dropdown
            if (elem instanceof HTMLElement) {
              elem.click();
              return { clicked: true, element: 'found' };
            }
          }
        }
        return { clicked: false };
      });
      
      if (pageSizeChanged.clicked) {
        console.log('[ZLS] Clicked page size dropdown, waiting for options...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Now try to click "All" option
        const allSelected = await page.evaluate(() => {
          // Look for "All" option in dropdown
          const options = Array.from(document.querySelectorAll('div[role="option"], li, button, a'));
          const allOption = options.find(opt => {
            const text = opt.textContent?.trim().toLowerCase();
            return text === 'all' || text === 'show all';
          });
          
          if (allOption && allOption instanceof HTMLElement) {
            allOption.click();
            return true;
          }
          return false;
        });
        
        if (allSelected) {
          console.log('[ZLS] Selected "All" page size, waiting for table to reload...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.log('[ZLS] Could not find "All" option, will use pagination');
        }
      } else {
        console.log('[ZLS] Could not find page size dropdown, will use pagination');
      }
    } catch (e) {
      console.log('[ZLS] Error setting page size:', e instanceof Error ? e.message : String(e));
      console.log('[ZLS] Will use pagination instead');
    }

    const allProperties: ScrapedProperty[] = [];

    // Extract all data from the current page (which should now show all properties if "All" was selected)
    console.log('[ZLS] Extracting property data...');
    const pageProperties = await page.evaluate(() => {
        const properties: any[] = [];
        const rows = document.querySelectorAll('table tbody tr');

        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length < 8) return;

          const taxOffice = cells[0]?.textContent?.trim() || '';
          const parcelId = cells[1]?.textContent?.trim() || '';
          const status = cells[2]?.textContent?.trim() || '';
          const saleDate = cells[3]?.textContent?.trim() || '';
          const upsetBidding = cells[4]?.textContent?.trim() || '';
          const openingBid = cells[5]?.textContent?.trim() || '';
          const currentBid = cells[6]?.textContent?.trim() || '';
          const address = cells[8]?.textContent?.trim() || '';

          // Only include active listings (Upcoming Sales or Upset Bidding)
          if (status.includes('Upcoming') || status.includes('Upset') || status.includes('Pending')) {
            properties.push({
              taxOffice,
              parcelId,
              status,
              saleDate,
              upsetBidding,
              openingBid,
              currentBid,
              address
            });
          }
        });

        return properties;
      });

    // Process extracted data
    for (const prop of pageProperties) {
        // Extract county from tax office name
        const county = prop.taxOffice.replace(/Tax Office$/i, '').replace(/County/i, '').trim();
        
        // Parse sale date
        let saleDateObj: Date | null = null;
        if (prop.saleDate) {
          try {
            saleDateObj = new Date(prop.saleDate);
          } catch (e) {
            console.log(`[ZLS] Could not parse date: ${prop.saleDate}`);
          }
        }

        // Parse upset deadline
        let upsetBidCloseDateObj: Date | null = null;
        if (prop.upsetBidding && prop.upsetBidding !== 'n/a') {
          try {
            upsetBidCloseDateObj = new Date(prop.upsetBidding);
          } catch (e) {
            console.log(`[ZLS] Could not parse upset deadline: ${prop.upsetBidding}`);
          }
        }

        // Parse opening bid
        let openingBidNum: number | null = null;
        if (prop.openingBid) {
          const bidMatch = prop.openingBid.match(/[\d,]+\.?\d*/);
          if (bidMatch) {
            openingBidNum = parseFloat(bidMatch[0].replace(/,/g, ''));
          }
        }

        // Parse current bid
        let currentBidNum: number | null = null;
        if (prop.currentBid && prop.currentBid !== 'n/a') {
          const bidMatch = prop.currentBid.match(/[\d,]+\.?\d*/);
          if (bidMatch) {
            currentBidNum = parseFloat(bidMatch[0].replace(/,/g, ''));
          }
        }

        // Extract city from address
        let city: string | null = null;
        let cleanAddress: string | null = prop.address;
        if (prop.address) {
          const addressParts = prop.address.split(',');
          if (addressParts.length >= 2) {
            city = addressParts[addressParts.length - 2].trim();
            // Remove state and zip from city if present
            if (city) city = city.replace(/\s+NC\s+\d+/, '').trim();
          }
        }

        allProperties.push({
          county: standardizeCountyName(county),
          address: cleanAddress,
          city,
          parcelId: prop.parcelId || null,
          saleDate: saleDateObj,
          saleTime: null,
          saleStatus: mapZLSStatus(prop.status || 'scheduled'),
          saleLocation: 'Courthouse steps',
          openingBid: openingBidNum,
          currentBid: currentBidNum,
          upsetBidCloseDate: upsetBidCloseDateObj,
          propertyType: null,
          legalDescription: null,
          owner: null,
          caseNumber: null,
          deedBookPage: null,
          depositRequired: null,
          noticeText: null,
          source: 'ZLS',
          sourceType: 'zls',
          sourceUrl: 'https://www.zls-nc.com/listings',
          rawData: JSON.stringify(prop)
        });
    }

    console.log(`[ZLS] Scraping complete. Found ${allProperties.length} total properties`);
    
    // Optionally extract detailed notice information for each property
    if (extractNotices) {
      console.log(`[ZLS] Extracting notice details (max ${maxNotices} properties)...`);
      const propertiesToProcess = allProperties.slice(0, maxNotices);
      await extractNoticeDetails(page, propertiesToProcess, maxNotices);
    } else {
      console.log('[ZLS] Skipping notice extraction (set extractNotices: true to enable)');
    }
    
    return allProperties;

  } catch (error) {
    console.error('[ZLS] Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Extract detailed notice information for each property by clicking Notice buttons
 */
async function extractNoticeDetails(page: any, properties: ScrapedProperty[], maxNotices: number): Promise<void> {
  // Go back to page 1 to start clicking Notice buttons
  await page.goto('https://www.zls-nc.com/listings', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.waitForSelector('table', { timeout: 30000 });
  
  let processedCount = 0;
  let currentPageNum = 1;
  let hasMorePages = true;
  
  while (hasMorePages && currentPageNum <= 23 && processedCount < properties.length) {
    console.log(`[ZLS] Extracting notices from page ${currentPageNum}...`);
    
    // Get all Notice buttons on current page
    const noticeButtons = await page.$$('button');
    const noticeButtonsFiltered = [];
    
    for (const btn of noticeButtons) {
      const text = await page.evaluate((el: any) => el.textContent, btn);
      if (text?.trim() === 'Notice') {
        noticeButtonsFiltered.push(btn);
      }
    }
    
    console.log(`[ZLS] Found ${noticeButtonsFiltered.length} Notice buttons on page ${currentPageNum}`);
    
    // Click each Notice button and extract details
    for (let i = 0; i < noticeButtonsFiltered.length && processedCount < properties.length; i++) {
      try {
        // Click the Notice button
        await noticeButtonsFiltered[i].click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extract notice text from textarea
        const noticeText = await page.evaluate(() => {
          const textarea = document.querySelector('textarea');
          return textarea ? textarea.value : null;
        });
        
        if (noticeText) {
          // Parse the notice text
          const details = parseNoticeText(noticeText);
          
          // Find matching property by parcel ID from notice
          const parcelMatch = noticeText.match(/Parcel Identification Number:\s*([\w-]+)/i);
          if (parcelMatch) {
            const parcelId = parcelMatch[1].trim();
            const property = properties.find(p => p.parcelId === parcelId);
            
            if (property) {
              property.owner = details.owner;
              property.caseNumber = details.caseNumber;
              property.legalDescription = details.legalDescription;
              property.deedBookPage = details.deedBookPage;
              property.depositRequired = details.depositRequired;
              property.noticeText = details.noticeText;
              processedCount++;
              
              if (processedCount % 10 === 0) {
                console.log(`[ZLS] Processed ${processedCount}/${properties.length} notices`);
              }
            }
          }
        }
        
        // Close the modal
        const closeButton = await page.$('button[aria-label="Close"]');
        if (closeButton) {
          await closeButton.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (e) {
        console.log(`[ZLS] Error extracting notice ${i + 1}:`, e instanceof Error ? e.message : String(e));
      }
    }
    
    // Go to next page
    if (currentPageNum < 23) {
      const nextClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const nextBtn = buttons.find(btn => {
          const label = btn.getAttribute('aria-label');
          return label && label.toLowerCase().includes('next');
        });
        
        if (!nextBtn) return { success: false };
        
        const isDisabled = nextBtn.hasAttribute('disabled') || 
                         nextBtn.classList.contains('disabled') ||
                         nextBtn.classList.contains('dxbl-disabled');
        
        if (isDisabled) return { success: false, disabled: true };
        
        (nextBtn as HTMLElement).click();
        return { success: true };
      });
      
      if (nextClicked.success) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        currentPageNum++;
      } else {
        hasMorePages = false;
      }
    } else {
      hasMorePages = false;
    }
  }
  
  console.log(`[ZLS] Notice extraction complete. Processed ${processedCount}/${properties.length} properties`);
}
