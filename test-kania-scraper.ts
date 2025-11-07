/**
 * Test script to run Kania scraper and display results
 */

import { KaniaScraper } from './scrapers/kania_scraper';

async function testKaniaScraper() {
  console.log('Starting Kania scraper test...\n');
  
  const scraper = new KaniaScraper();
  const properties = await scraper.scrape();
  
  console.log(`\n✅ Scraped ${properties.length} properties\n`);
  
  // Show first 5 properties with upset status
  const upsetProperties = properties.filter(p => p.saleStatus === 'in_upset_period');
  console.log(`Found ${upsetProperties.length} properties in upset period\n`);
  
  console.log('First 5 upset period properties:');
  upsetProperties.slice(0, 5).forEach((prop, idx) => {
    console.log(`\n${idx + 1}. ${prop.county} - ${prop.address}`);
    console.log(`   Sale Date: ${prop.saleDate}`);
    console.log(`   Opening Bid: $${prop.openingBid ? (prop.openingBid / 100).toFixed(2) : 'N/A'}`);
    console.log(`   Current Bid: $${prop.currentBid ? (prop.currentBid / 100).toFixed(2) : 'N/A'}`);
    console.log(`   ⭐ Upset Close Date: ${prop.upsetBidCloseDate || 'NULL'}`);
    console.log(`   Status: ${prop.saleStatus}`);
  });
  
  // Check coverage
  const withCloseDate = upsetProperties.filter(p => p.upsetBidCloseDate !== null).length;
  const coverage = upsetProperties.length > 0 
    ? ((withCloseDate / upsetProperties.length) * 100).toFixed(1) 
    : '0.0';
  
  console.log(`\n📊 Upset Close Date Coverage: ${withCloseDate}/${upsetProperties.length} (${coverage}%)`);
}

testKaniaScraper().catch(console.error);
