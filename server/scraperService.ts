/**
 * Scraper Service - Orchestrates scraping and data import
 */

import { scrapeKania } from '../scrapers/kania_scraper';
import { scrapeHutchens } from '../scrapers/hutchens_scraper';
import { scrapeWakeCounty } from '../scrapers/wake_county_scraper';
import { scrapeRBCWB } from '../scrapers/rbcwb_scraper';
import { scrapeForsyth } from '../scrapers/forsyth_county_scraper';
import { scrapeGaston } from '../scrapers/gaston_county_scraper';
import { scrapeAlamance } from '../scrapers/alamance_county_scraper';
import { scrapeCatawba } from '../scrapers/catawba_county_scraper';
import { scrapeCabarrus } from '../scrapers/cabarrus_county_scraper';
import { scrapeRutherford } from '../scrapers/rutherford_county_scraper';
import { scrapeEdgecombeCounty } from '../scrapers/edgecombe_county_scraper';
import { scrapeHokeCounty } from '../scrapers/hoke_county_scraper';
import { scrapeAnsonCounty } from '../scrapers/anson_county_scraper';
import { scrapeBladenCounty } from '../scrapers/bladen_county_scraper';
import { scrapeYadkinCounty } from '../scrapers/yadkin_county_scraper';
import { scrapeCumberlandCounty } from '../scrapers/cumberland_county_scraper';
import { scrapeMcDowellCounty } from '../scrapers/mcdowell_county_scraper';
import { scrapeZLS } from '../scrapers/zls_scraper';
import { getDb } from './db';
import { properties, scrapeHistory, InsertProperty, InsertScrapeHistory } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export type ScraperName = 'kania' | 'hutchens' | 'wake_county' | 'rbcwb' | 'forsyth' | 'gaston' | 'alamance' | 'catawba' | 'cabarrus' | 'rutherford' | 'edgecombe' | 'hoke' | 'yadkin' | 'anson' | 'bladen' | 'cumberland' | 'mcdowell' | 'zls' | 'all';

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
  upsetDeadline?: Date | null;
  propertyType?: string | null;
  legalDescription?: string | null;
  owner?: string | null;
  caseNumber?: string | null;
  source: string;
  sourceType?: string | null;
  sourceUrl?: string | null;
  rawData?: string | null;
}

export class ScraperService {
  /**
   * Run a specific scraper
   */
  async runScraper(scraperName: ScraperName): Promise<{ success: boolean; count: number; error?: string }> {
    if (scraperName === 'all') {
      return this.scrapeAll();
    }

    const startTime = new Date();
    const sourceNames: Record<ScraperName, string> = {
      kania: 'Kania Law Firm',
      hutchens: 'Hutchens Law Firm',
      wake_county: 'Wake County',
      rbcwb: 'RBCWB Law Firm',
      forsyth: 'Forsyth County',
      gaston: 'Gaston County',
      alamance: 'Alamance County',
      catawba: 'Catawba County',
      cabarrus: 'Cabarrus County',
      rutherford: 'Rutherford County',
      edgecombe: 'Edgecombe County',
      hoke: 'Hoke County',
      yadkin: 'Yadkin County',
      anson: 'Anson County',
      bladen: 'Bladen County',
      cumberland: 'Cumberland County',
      mcdowell: 'McDowell County',
      zls: 'ZLS (Zacchaeus Legal Services)',
      all: 'All Sources'
    };

    const historyRecord: InsertScrapeHistory = {
      sourceName: sourceNames[scraperName],
      sourceType: scraperName,
      scrapeStartedAt: startTime,
      scrapeCompletedAt: null,
      status: 'failed',
      propertiesFound: 0,
      propertiesNew: 0,
      propertiesUpdated: 0,
      errorMessage: null,
      metadata: null,
    };

    try {
      console.log(`[ScraperService] Running ${scraperName} scraper...`);
      
      let properties: PropertyData[] = [];

      switch (scraperName) {
        case 'kania':
          properties = await scrapeKania();
          break;
        case 'hutchens':
          properties = await scrapeHutchens();
          break;
        case 'wake_county':
          properties = await scrapeWakeCounty();
          break;
        case 'rbcwb':
          properties = await scrapeRBCWB();
          break;
        case 'forsyth':
          properties = await scrapeForsyth();
          break;
        case 'gaston':
          properties = await scrapeGaston();
          break;
        case 'alamance':
          properties = await scrapeAlamance();
          break;
        case 'catawba':
          properties = await scrapeCatawba();
          break;
        case 'cabarrus':
          properties = await scrapeCabarrus();
          break;
        case 'rutherford':
          properties = await scrapeRutherford();
          break;
        case 'edgecombe':
          properties = await scrapeEdgecombeCounty();
          break;
        case 'hoke':
          properties = await scrapeHokeCounty();
          break;
        case 'yadkin':
          properties = await scrapeYadkinCounty();
          break;
        case 'anson':
          properties = await scrapeAnsonCounty();
          break;
        case 'bladen':
          properties = await scrapeBladenCounty();
          break;
        case 'cumberland':
          properties = await scrapeCumberlandCounty();
          break;
        case 'mcdowell':
          properties = await scrapeMcDowellCounty();
          break;
        // case 'wayne':
        //   properties = await scrapeWayneCounty();
          break;
        case 'zls':
          properties = await scrapeZLS();
          break;
        default:
          throw new Error(`Unknown scraper: ${scraperName}`);
      }

      console.log(`[ScraperService] Scraped ${properties.length} properties`);
      historyRecord.propertiesFound = properties.length;

      // Import into database
      const { newCount, updatedCount } = await this.importProperties(properties);

      historyRecord.propertiesNew = newCount;
      historyRecord.propertiesUpdated = updatedCount;
      historyRecord.status = 'success';
      historyRecord.scrapeCompletedAt = new Date();

      // Save history
      const db = await getDb();
      if (db) {
        await db.insert(scrapeHistory).values(historyRecord);
      }

      return { success: true, count: properties.length };

    } catch (error: any) {
      console.error('[ScraperService] Error:', error);
      
      historyRecord.errorMessage = error.message || String(error);
      historyRecord.scrapeCompletedAt = new Date();
      
      // Save error history
      const db = await getDb();
      if (db) {
        await db.insert(scrapeHistory).values(historyRecord);
      }

      return { success: false, count: 0, error: error.message };
    }
  }

  /**
   * Import scraped properties into database
   */
  private async importProperties(scrapedProperties: PropertyData[]): Promise<{ newCount: number; updatedCount: number }> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    let newCount = 0;
    let updatedCount = 0;

    for (const prop of scrapedProperties) {
      try {
        // Normalize parcelId: convert empty strings to null
        const normalizedParcelId = prop.parcelId && prop.parcelId.trim() !== '' ? prop.parcelId.trim() : null;
        const normalizedAddress = prop.address && prop.address.trim() !== '' ? prop.address.trim() : null;
        
        // Determine unique identifier - try parcelId first, then address
        const uniqueKey = normalizedParcelId || normalizedAddress;
        if (!uniqueKey) {
          console.warn('[ScraperService] Skipping property without parcelId or address:', prop);
          continue;
        }

        // Check if property already exists
        let existing;
        if (normalizedParcelId) {
          existing = await db
            .select()
            .from(properties)
            .where(
              and(
                eq(properties.county, prop.county),
                eq(properties.parcelId, normalizedParcelId)
              )
            )
            .limit(1);
        } else if (normalizedAddress) {
          existing = await db
            .select()
            .from(properties)
            .where(
              and(
                eq(properties.county, prop.county),
                eq(properties.address, normalizedAddress)
              )
            )
            .limit(1);
        }

        // Convert string dates to Date objects if needed
        const saleDate = prop.saleDate ? (typeof prop.saleDate === 'string' ? new Date(prop.saleDate) : prop.saleDate) : null;
        // Support both upsetDeadline and upsetBidCloseDate field names
        const upsetDateValue = (prop as any).upsetDeadline || (prop as any).upsetBidCloseDate;
        const upsetDeadline = upsetDateValue ? (typeof upsetDateValue === 'string' ? new Date(upsetDateValue) : upsetDateValue) : null;

        const propertyData: InsertProperty = {
          county: prop.county,
          address: normalizedAddress,
          city: prop.city || null,
          parcelId: normalizedParcelId || uniqueKey,
          saleDate: saleDate,
          saleTime: prop.saleTime || null,
          saleStatus: (prop.saleStatus as any) || 'scheduled',
          saleLocation: prop.saleLocation || null,
          openingBid: prop.openingBid || null,
          currentBid: prop.currentBid || null,
          upsetBidCloseDate: upsetDeadline,
          propertyType: prop.propertyType || null,
          legalDescription: prop.legalDescription || null,
          courtFileNumber: prop.caseNumber || null,
          sourceUrl: prop.sourceUrl || null,
          sourceType: prop.sourceType || prop.source,
          isActive: 1,
        };

        if (existing && existing.length > 0) {
          // Update existing property
          await db
            .update(properties)
            .set({
              ...propertyData,
              lastUpdatedAt: new Date(),
            })
            .where(eq(properties.id, existing[0].id));
          updatedCount++;
        } else {
          // Insert new property
          await db.insert(properties).values(propertyData);
          newCount++;
        }
      } catch (error) {
        console.error('[ScraperService] Error importing property:', error, prop);
        // Continue with next property
      }
    }

    console.log(`[ScraperService] Imported ${newCount} new, updated ${updatedCount} existing properties`);
    return { newCount, updatedCount };
  }

  /**
   * Run all scrapers
   */
  async scrapeAll(): Promise<{ success: boolean; count: number; error?: string }> {
    const results: Array<{ source: string; success: boolean; count: number }> = [];
    let totalCount = 0;

    // Run all scrapers
    const scrapers: ScraperName[] = ['kania', 'hutchens', 'wake_county', 'rbcwb', 'forsyth', 'gaston', 'alamance', 'catawba', 'cabarrus', 'rutherford', 'edgecombe', 'hoke', 'yadkin', 'anson', 'bladen', 'cumberland', 'mcdowell', 'zls'];
    
    for (const scraper of scrapers) {
      const result = await this.runScraper(scraper);
      results.push({ source: scraper, ...result });
      if (result.success) {
        totalCount += result.count;
      }
    }

    const allSuccess = results.every(r => r.success);
    return { 
      success: allSuccess, 
      count: totalCount,
      error: allSuccess ? undefined : 'Some scrapers failed'
    };
  }
}
