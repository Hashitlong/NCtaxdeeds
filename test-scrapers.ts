#!/usr/bin/env tsx
/**
 * Test script to diagnose scraper issues
 */

import { scrapeHutchens } from './scrapers/hutchens_scraper';
import { scrapeKania } from './scrapers/kania_scraper';
import { scrapeZLS } from './scrapers/zls_scraper';

async function testScraper(name: string, scraperFn: () => Promise<any[]>) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${name} scraper...`);
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  try {
    const results = await scraperFn();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ SUCCESS: ${name}`);
    console.log(`   Properties found: ${results.length}`);
    console.log(`   Duration: ${duration}s`);
    
    if (results.length > 0) {
      console.log(`   Sample property:`, JSON.stringify(results[0], null, 2).substring(0, 300));
    }
    
    return { name, success: true, count: results.length, duration };
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${error.message}`);
    console.log(`   Duration: ${duration}s`);
    if (error.stack) {
      console.log(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
    }
    
    return { name, success: false, error: error.message, duration };
  }
}

async function main() {
  console.log('NC Tax Deed Scraper Diagnostic Tool');
  console.log('====================================\n');
  
  const results = [];
  
  // Test each scraper with timeout
  const scrapers = [
    { name: 'Hutchens', fn: scrapeHutchens },
    { name: 'Kania', fn: scrapeKania },
    { name: 'ZLS', fn: () => scrapeZLS({ extractNotices: false, maxNotices: 0 }) },
  ];
  
  for (const scraper of scrapers) {
    const result = await testScraper(scraper.name, scraper.fn);
    results.push(result);
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.name}: ${r.count} properties in ${r.duration}s`);
  });
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
    failed.forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }
  
  console.log('\n');
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});