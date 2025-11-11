#!/usr/bin/env tsx
/**
 * Check for scraper issues in the database
 */

import 'dotenv/config';
import { getDb } from './server/db';
import { scrapeHistory, properties } from './drizzle/schema';
import { desc, sql } from 'drizzle-orm';

async function main() {
  console.log('Checking scraper issues...\n');
  
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    return;
  }

  // Check recent scrape history
  console.log('=== Recent Scrape History ===');
  const history = await db
    .select()
    .from(scrapeHistory)
    .orderBy(desc(scrapeHistory.scrapeStartedAt))
    .limit(10);
  
  if (history.length === 0) {
    console.log('No scrape history found');
  } else {
    history.forEach(h => {
      const status = h.status === 'success' ? '✅' : '❌';
      console.log(`${status} ${h.sourceName} (${h.sourceType})`);
      console.log(`   Started: ${h.scrapeStartedAt}`);
      console.log(`   Status: ${h.status}`);
      console.log(`   Found: ${h.propertiesFound}, New: ${h.propertiesNew}, Updated: ${h.propertiesUpdated}`);
      if (h.errorMessage) {
        console.log(`   Error: ${h.errorMessage}`);
      }
      console.log('');
    });
  }

  // Check property counts by source
  console.log('\n=== Properties by Source ===');
  const propertyCounts = await db
    .select({
      sourceType: properties.sourceType,
      count: sql<number>`count(*)`,
    })
    .from(properties)
    .groupBy(properties.sourceType);
  
  propertyCounts.forEach(p => {
    console.log(`${p.sourceType}: ${p.count} properties`);
  });

  // Check for data quality issues
  console.log('\n=== Data Quality Issues ===');
  
  const missingParcelId = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(sql`${properties.parcelId} IS NULL OR ${properties.parcelId} = ''`);
  console.log(`Properties missing parcel ID: ${missingParcelId[0].count}`);
  
  const missingSaleDate = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(sql`${properties.saleDate} IS NULL`);
  console.log(`Properties missing sale date: ${missingSaleDate[0].count}`);
  
  const missingAddress = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(sql`${properties.address} IS NULL OR ${properties.address} = ''`);
  console.log(`Properties missing address: ${missingAddress[0].count}`);

  // Sample problematic properties
  console.log('\n=== Sample Problematic Properties ===');
  const problematic = await db
    .select()
    .from(properties)
    .where(sql`${properties.saleDate} IS NULL OR ${properties.address} IS NULL`)
    .limit(5);
  
  problematic.forEach(p => {
    console.log(`\nID: ${p.id}`);
    console.log(`County: ${p.county}`);
    console.log(`Address: ${p.address || 'MISSING'}`);
    console.log(`Parcel ID: ${p.parcelId || 'MISSING'}`);
    console.log(`Sale Date: ${p.saleDate || 'MISSING'}`);
    console.log(`Source: ${p.sourceType}`);
  });
}

main().catch(console.error);