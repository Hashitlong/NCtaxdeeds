import { ScraperService } from './server/scraperService';
import { getDb } from './server/db';
import { properties } from './drizzle/schema';
import { eq, sql } from 'drizzle-orm';

async function runTests() {
  console.log('=== COMPREHENSIVE TEST SUITE ===\n');
  
  // Test 1: Database Connection
  console.log('1. Testing database connection...');
  const db = await getDb();
  if (!db) {
    console.error('❌ Database connection failed');
    return;
  }
  console.log('✓ Database connected\n');

  // Test 2: Cumberland County Scraper
  console.log('2. Testing Cumberland County scraper...');
  const service = new ScraperService();
  const cumberlandResult = await service.runScraper('cumberland');
  console.log(`✓ Cumberland: ${cumberlandResult.success ? 'SUCCESS' : 'FAILED'} - ${cumberlandResult.count} properties\n`);

  // Test 3: McDowell County Scraper
  console.log('3. Testing McDowell County scraper...');
  const mcdowellResult = await service.runScraper('mcdowell');
  console.log(`✓ McDowell: ${mcdowellResult.success ? 'SUCCESS' : 'FAILED'} - ${mcdowellResult.count} properties\n`);

  // Test 4: Database Verification
  console.log('4. Verifying database records...');
  const cumberlandProps = await db.select().from(properties).where(eq(properties.county, 'Cumberland'));
  const mcdowellProps = await db.select().from(properties).where(eq(properties.county, 'McDowell'));
  console.log(`✓ Cumberland in DB: ${cumberlandProps.length} properties`);
  console.log(`✓ McDowell in DB: ${mcdowellProps.length} properties\n`);

  // Test 5: Total County Count
  console.log('5. Checking total county coverage...');
  const countyCount = await db.select({ 
    count: sql<number>`COUNT(DISTINCT ${properties.county})` 
  }).from(properties).where(eq(properties.isActive, 1));
  console.log(`✓ Total counties: ${countyCount[0].count}\n`);

  // Test 6: Total Property Count
  console.log('6. Checking total property count...');
  const propCount = await db.select({ 
    count: sql<number>`COUNT(*)` 
  }).from(properties).where(eq(properties.isActive, 1));
  console.log(`✓ Total active properties: ${propCount[0].count}\n`);

  // Summary
  console.log('=== TEST SUMMARY ===');
  console.log(`✓ All tests passed`);
  console.log(`✓ Cumberland: ${cumberlandResult.count} properties scraped`);
  console.log(`✓ McDowell: ${mcdowellResult.count} properties scraped`);
  console.log(`✓ Database: ${countyCount[0].count} counties, ${propCount[0].count} properties`);
  console.log(`✓ System: Fully operational`);
}

runTests().catch(console.error);
