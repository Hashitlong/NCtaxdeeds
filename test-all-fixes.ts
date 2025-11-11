#!/usr/bin/env tsx
/**
 * Test all scraper fixes
 */

import 'dotenv/config';
import { ScraperService } from './server/scraperService';
import { getDb } from './server/db';
import { sql } from 'drizzle-orm';

async function testDatabaseConnection() {
  console.log('\n=== Testing Database Connection ===');
  
  const db = await getDb();
  if (!db) {
    console.log('❌ Database not available');
    return false;
  }
  
  try {
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
    return true;
  } catch (error: any) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function testHutchensScraper() {
  console.log('\n=== Testing Hutchens Scraper ===');
  
  const service = new ScraperService();
  const result = await service.runScraper('hutchens');
  
  if (result.success) {
    console.log(`✅ Hutchens scraper succeeded`);
    console.log(`   Properties found: ${result.count}`);
    return true;
  } else {
    console.log(`❌ Hutchens scraper failed: ${result.error}`);
    return false;
  }
}

async function testKaniaScraper() {
  console.log('\n=== Testing Kania Scraper ===');
  
  const service = new ScraperService();
  const result = await service.runScraper('kania');
  
  if (result.success) {
    console.log(`✅ Kania scraper succeeded`);
    console.log(`   Properties found: ${result.count}`);
    return true;
  } else {
    console.log(`❌ Kania scraper failed: ${result.error}`);
    return false;
  }
}

async function testDatabaseHealthCheck() {
  console.log('\n=== Testing Database Health Check ===');
  
  // Temporarily break the database connection
  const originalUrl = process.env.DATABASE_URL;
  process.env.DATABASE_URL = '';
  
  const service = new ScraperService();
  const result = await service.runScraper('hutchens');
  
  // Restore the connection
  process.env.DATABASE_URL = originalUrl;
  
  if (!result.success && result.error?.includes('Database')) {
    console.log('✅ Database health check working correctly');
    console.log(`   Error message: ${result.error}`);
    return true;
  } else {
    console.log('❌ Database health check not working');
    return false;
  }
}

async function checkScrapeHistory() {
  console.log('\n=== Checking Scrape History ===');
  
  const db = await getDb();
  if (!db) {
    console.log('❌ Database not available');
    return false;
  }
  
  try {
    const { scrapeHistory } = await import('./drizzle/schema');
    const { desc } = await import('drizzle-orm');
    
    const history = await db
      .select()
      .from(scrapeHistory)
      .orderBy(desc(scrapeHistory.scrapeStartedAt))
      .limit(5);
    
    console.log(`✅ Found ${history.length} recent scrape records`);
    
    if (history.length > 0) {
      const latest = history[0];
      console.log(`   Latest: ${latest.sourceName} - ${latest.status}`);
      console.log(`   Properties: ${latest.propertiesFound} found, ${latest.propertiesNew} new, ${latest.propertiesUpdated} updated`);
    }
    
    return true;
  } catch (error: any) {
    console.log('❌ Failed to check scrape history:', error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  NC Tax Deed Scraper - Fix Verification   ║');
  console.log('╚════════════════════════════════════════════╝');
  
  const results = {
    database: await testDatabaseConnection(),
    hutchens: false,
    kania: false,
    healthCheck: false,
    history: false,
  };
  
  if (results.database) {
    results.hutchens = await testHutchensScraper();
    results.kania = await testKaniaScraper();
    results.healthCheck = await testDatabaseHealthCheck();
    results.history = await checkScrapeHistory();
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║              TEST SUMMARY                  ║');
  console.log('╚════════════════════════════════════════════╝');
  
  const tests = [
    { name: 'Database Connection', passed: results.database },
    { name: 'Hutchens Scraper', passed: results.hutchens },
    { name: 'Kania Scraper', passed: results.kania },
    { name: 'Database Health Check', passed: results.healthCheck },
    { name: 'Scrape History', passed: results.history },
  ];
  
  tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
  });
  
  const passedCount = tests.filter(t => t.passed).length;
  const totalCount = tests.length;
  
  console.log(`\nPassed: ${passedCount}/${totalCount}`);
  
  if (passedCount === totalCount) {
    console.log('\n🎉 All tests passed! Scrapers are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  process.exit(passedCount === totalCount ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});