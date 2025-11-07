/**
 * Fetch notice details for a single ZLS property on-demand
 */

import puppeteer from 'puppeteer';
import { parseNoticeText, type NoticeDetails } from './zls_notice_extractor';

export interface PropertyNoticeResult {
  success: boolean;
  details?: NoticeDetails;
  error?: string;
}

/**
 * Fetch notice details for a specific property by parcel ID
 * This is used for on-demand fetching when user views property details
 */
export async function fetchZLSNotice(parcelId: string, county: string): Promise<PropertyNoticeResult> {
  console.log(`[ZLS Notice Fetcher] Fetching notice for parcel ${parcelId} in ${county}...`);
  
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

    // Wait for Blazor
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Click I AGREE if present
    await page.waitForFunction(
      () => document.body.textContent?.includes('I AGREE'),
      { timeout: 30000 }
    );
    
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const agreeLink = links.find(el => el.textContent?.trim() === 'I AGREE');
      if (agreeLink && agreeLink instanceof HTMLElement) {
        agreeLink.click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.waitForSelector('table', { timeout: 30000 });
    
    // Search through all pages to find the property
    let found = false;
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages && currentPage <= 23 && !found) {
      console.log(`[ZLS Notice Fetcher] Searching page ${currentPage} for parcel ${parcelId}...`);
      
      // Check if parcel ID exists on current page
      const pageText = await page.evaluate(() => document.body.textContent);
      
      if (pageText?.includes(parcelId)) {
        console.log(`[ZLS Notice Fetcher] Found parcel ${parcelId} on page ${currentPage}`);
        
        // Find the Notice button for this parcel
        const noticeFound = await page.evaluate((targetParcelId) => {
          const rows = Array.from(document.querySelectorAll('table tbody tr'));
          
          for (const row of rows) {
            const cells = row.querySelectorAll('td');
            const rowParcelId = cells[1]?.textContent?.trim();
            
            if (rowParcelId === targetParcelId) {
              // Find Notice button in this row
              const noticeButton = row.querySelector('button');
              if (noticeButton && noticeButton.textContent?.trim() === 'Notice') {
                noticeButton.click();
                return true;
              }
            }
          }
          return false;
        }, parcelId);
        
        if (noticeFound) {
          found = true;
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Extract notice text
          const noticeText = await page.evaluate(() => {
            const textarea = document.querySelector('textarea');
            return textarea ? textarea.value : null;
          });
          
          if (noticeText) {
            const details = parseNoticeText(noticeText);
            console.log(`[ZLS Notice Fetcher] Successfully extracted notice for parcel ${parcelId}`);
            
            return {
              success: true,
              details
            };
          } else {
            return {
              success: false,
              error: 'Notice modal opened but no text found'
            };
          }
        }
      }
      
      // Go to next page
      if (currentPage < 23) {
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
          currentPage++;
        } else {
          hasMorePages = false;
        }
      } else {
        hasMorePages = false;
      }
    }
    
    if (!found) {
      console.log(`[ZLS Notice Fetcher] Parcel ${parcelId} not found in any page`);
      return {
        success: false,
        error: `Property with parcel ID ${parcelId} not found in ZLS listings`
      };
    }
    
    return {
      success: false,
      error: 'Unexpected error during notice extraction'
    };

  } catch (error) {
    console.error('[ZLS Notice Fetcher] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    await browser.close();
  }
}
