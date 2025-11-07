/**
 * Kania Law Firm Tax Foreclosure Scraper
 * Scrapes property listings from https://kanialawfirm.com/tax-foreclosures/foreclosure-listings/
 */

import puppeteer from 'puppeteer';
import { standardizeCountyName } from '../server/utils/standardizeCounty';

interface PropertyData {
  county: string;
  address: string;
  parcelId: string;
  saleDate: string | null;
  saleTime: string | null;
  saleStatus: string;
  openingBid: number | null;
  currentBid: number | null;
  upsetBidCloseDate: string | null;
  propertyType: string;
  courtFileNumber: string;
  attorneyFileNumber: string;
  attorneyFirm: string;
  sourceUrl: string;
  sourceType: string;
}

class KaniaScraper {
  private baseUrl = 'https://kanialawfirm.com/tax-foreclosures/foreclosure-listings/';

  async scrape(): Promise<PropertyData[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      console.error(`Navigating to ${this.baseUrl}...`);
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait a bit for any dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for and handle disclaimer if present
      try {
        const checkbox = await page.$('input[type="checkbox"]');
        if (checkbox) {
          await checkbox.click();
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const submitBtn = await page.$('button:has-text("Submit")');
          if (submitBtn) {
            await submitBtn.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      } catch (e) {
        // No disclaimer, continue
      }

      // Wait for table
      await page.waitForSelector('table', { timeout: 10000 });

      // Extract all properties from all pages
      const allProperties: any[] = [];
      let currentPage = 1;
      let hasNextPage = true;
      const MAX_PAGES = 20; // Safety limit to prevent infinite loops
      let previousPageParcelIds: Set<string> = new Set();

      while (hasNextPage && currentPage <= MAX_PAGES) {
        console.error(`Scraping page ${currentPage}...`);

        // Extract table data from current page
        const pageProperties = await page.evaluate(() => {
          const table = document.querySelector('table');
          if (!table) return [];

          const rows = Array.from(table.querySelectorAll('tr'));
          const dataRows = rows.slice(1); // Skip header

          return dataRows.map((row, rowIndex) => {
            const cols = Array.from(row.querySelectorAll('td'));
            if (cols.length < 11) return null;

            // DEBUG: Log first row to see column contents
            if (rowIndex === 0) {
              console.error(`\n=== KANIA SCRAPER DEBUG - First Row Column Contents ===`);
              cols.forEach((col, idx) => {
                console.error(`Column ${idx}: "${col?.textContent?.trim() || ''}"`);
              });
              console.error(`Total columns: ${cols.length}`);
              console.error(`=== END DEBUG ===\n`);
            }

            return {
              county: cols[0]?.textContent?.trim() || '',
              address: cols[1]?.textContent?.trim() || '',
              parcelId: cols[2]?.textContent?.trim() || '',
              saleDateTimeRaw: cols[3]?.textContent?.trim() || '',
              openingBidRaw: cols[4]?.textContent?.trim() || '',
              currentBidRaw: cols[5]?.textContent?.trim() || '',
              closeDateRaw: cols[6]?.textContent?.trim() || '',
              propertyType: cols[7]?.textContent?.trim() || '',
              courtFileNumber: cols[8]?.textContent?.trim() || '',
              attorneyFileNumber: cols[9]?.textContent?.trim() || '',
              saleStatusRaw: cols[10]?.textContent?.trim() || '',
            };
          }).filter(Boolean);
        });

        console.error(`Found ${pageProperties.length} properties on page ${currentPage}`);

        // DEBUG: Log first property to see what data was extracted
        if (currentPage === 1 && pageProperties.length > 0) {
          console.error(`\n=== KANIA SCRAPER DEBUG - First Property Data ===`);
          console.error(JSON.stringify(pageProperties[0], null, 2));
          console.error(`=== END DEBUG ===\n`);
        }

        // Stop if we got 0 properties (end of list)
        if (pageProperties.length === 0) {
          hasNextPage = false;
          console.error(`Stopping: No properties found on page ${currentPage}`);
          break;
        }

        // Detect duplicate pages (infinite loop detection)
        const currentPageParcelIds = new Set(pageProperties.map((p: any) => p.parcelId).filter(Boolean));
        
        // Check if this page has the exact same parcelIds as the previous page
        if (currentPage > 1 && currentPageParcelIds.size > 0) {
          const isDuplicate = currentPageParcelIds.size === previousPageParcelIds.size &&
                            Array.from(currentPageParcelIds).every(id => previousPageParcelIds.has(id));
          
          if (isDuplicate) {
            hasNextPage = false;
            console.error(`Stopping: Page ${currentPage} has same properties as page ${currentPage - 1} (infinite loop detected)`);
            break;
          }
        }

        // Add properties to the result (only if not duplicates)
        allProperties.push(...pageProperties);
        previousPageParcelIds = currentPageParcelIds;

        // Check if there's a next page button
        const nextButtonInfo = await page.evaluate(() => {
          // Look for the next page button (›) or the last page button (»)
          const pagination = document.querySelector('.pagination, nav[aria-label="pagination"], .page-numbers');
          if (!pagination) return { exists: false, isDisabled: false };

          // Find the next button - look for › or "Next" text
          const links = Array.from(pagination.querySelectorAll('a'));
          const nextLink = links.find(link => {
            const text = link.textContent?.trim() || '';
            return text === '›' || text.toLowerCase().includes('next') || link.classList.contains('next');
          });

          if (nextLink) {
            const isDisabled = nextLink.classList.contains('disabled') || 
                             nextLink.getAttribute('aria-disabled') === 'true' ||
                             nextLink.hasAttribute('disabled');
            return { exists: true, isDisabled, href: nextLink.getAttribute('href') };
          }
          return { exists: false, isDisabled: false };
        });

        if (nextButtonInfo.exists && !nextButtonInfo.isDisabled) {
          // Click the next button
          await page.evaluate(() => {
            const pagination = document.querySelector('.pagination, nav[aria-label="pagination"], .page-numbers');
            if (!pagination) return;

            const links = Array.from(pagination.querySelectorAll('a'));
            const nextLink = links.find(link => {
              const text = link.textContent?.trim() || '';
              return text === '›' || text.toLowerCase().includes('next') || link.classList.contains('next');
            });

            if (nextLink) {
              (nextLink as HTMLElement).click();
            }
          });

          // Wait for the page to load
          await new Promise(resolve => setTimeout(resolve, 2000));
          await page.waitForSelector('table', { timeout: 10000 });
          currentPage++;
        } else {
          hasNextPage = false;
          console.error(`No more pages. Total pages scraped: ${currentPage}`);
        }
      }

      const properties = allProperties;
      console.error(`Total properties found across all pages: ${properties.length}`);

      // Process the raw data
      const processedProperties = properties.map(prop => this.parseProperty(prop)).filter(Boolean) as PropertyData[];

      return processedProperties;

    } catch (error) {
      console.error('Error scraping Kania Law Firm:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private parseProperty(raw: any): PropertyData | null {
    try {
      if (!raw.county || !raw.parcelId) return null;

      // Parse sale date and time
      let saleDate: string | null = null;
      let saleTime: string | null = null;
      
      if (raw.saleDateTimeRaw && raw.saleDateTimeRaw !== 'Sale date not yet set') {
        try {
          const match = raw.saleDateTimeRaw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/);
          if (match) {
            const [, month, day, year, hour, minute, second, ampm] = match;
            let hour24 = parseInt(hour);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            
            saleDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour24.toString().padStart(2, '0')}:${minute}:${second}`;
            saleTime = `${hour}:${minute} ${ampm}`;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      // Parse close date
      let upsetBidCloseDate: string | null = null;
      if (raw.closeDateRaw) {
        try {
          const match = raw.closeDateRaw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (match) {
            const [, month, day, year] = match;
            upsetBidCloseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        } catch (e) {
          // Ignore
        }
      }

      // Determine status
      let saleStatus: 'scheduled' | 'in_upset_period' | 'pending' | 'postponed' | 'sold' | 'cancelled' = 'scheduled';
      const now = new Date();
      const saleDateObj = saleDate ? new Date(saleDate) : null;
      const upsetBidCloseDateObj = upsetBidCloseDate ? new Date(upsetBidCloseDate) : null;
      
      if (upsetBidCloseDateObj && now <= upsetBidCloseDateObj) {
        // Property is in upset period (deadline exists and hasn't expired)
        // Upset period continues after sale as long as deadline hasn't passed
        saleStatus = 'in_upset_period';
      } else if (upsetBidCloseDateObj && now > upsetBidCloseDateObj) {
        // Upset period has ended
        saleStatus = 'sold';
      } else if (!saleDateObj) {
        // No sale date set yet
        saleStatus = 'scheduled';
      } else if (saleDateObj > now) {
        // Sale scheduled for future
        saleStatus = 'scheduled';
      } else {
        // Sale occurred but no upset period
        saleStatus = 'sold';
      }

      return {
        county: raw.county,
        address: raw.address,
        parcelId: raw.parcelId,
        saleDate,
        saleTime,
        saleStatus,
        openingBid: this.parseCurrency(raw.openingBidRaw),
        currentBid: this.parseCurrency(raw.currentBidRaw),
        upsetBidCloseDate,
        propertyType: raw.propertyType,
        courtFileNumber: raw.courtFileNumber,
        attorneyFileNumber: raw.attorneyFileNumber,
        attorneyFirm: 'Kania Law Firm',
        sourceUrl: this.baseUrl,
        sourceType: 'kania',
      };
    } catch (error) {
      console.error('Error parsing property:', error);
      return null;
    }
  }

  private parseCurrency(value: string): number | null {
    if (!value) return null;
    try {
      const cleaned = value.replace(/[$,]/g, '').trim();
      if (!cleaned) return null;
      return Math.round(parseFloat(cleaned) * 100); // Convert to cents
    } catch {
      return null;
    }
  }
}

export async function scrapeKania() {
  const scraper = new KaniaScraper();
  const properties = await scraper.scrape();
  
  // Transform to match PropertyData interface expected by scraperService
  return properties.map(prop => ({
    county: standardizeCountyName(prop.county || ''),
    address: prop.address,
    parcelId: prop.parcelId,
    saleDate: prop.saleDate ? new Date(prop.saleDate) : null,
    saleTime: prop.saleTime,
    saleStatus: prop.saleStatus,
    openingBid: prop.openingBid,
    currentBid: prop.currentBid,
    upsetBidCloseDate: prop.upsetBidCloseDate ? new Date(prop.upsetBidCloseDate) : null,
    propertyType: prop.propertyType,
    caseNumber: prop.courtFileNumber,
    source: 'kania',
    sourceUrl: prop.sourceUrl,
    sourceType: prop.sourceType,
    rawData: JSON.stringify(prop)
  }));
}

async function main() {
  const properties = await scrapeKania();
  console.log(JSON.stringify(properties, null, 2));
  process.exit(properties.length > 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
