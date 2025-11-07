import { scrapeZLS } from './scrapers/zls_scraper.ts';

console.log('Testing enhanced ZLS scraper with notice extraction...\n');

try {
  const properties = await scrapeZLS();
  
  console.log(`\n✅ Scraping complete! Found ${properties.length} properties\n`);
  
  // Show sample property with notice details
  const sampleWithNotice = properties.find(p => p.noticeText);
  
  if (sampleWithNotice) {
    console.log('=== SAMPLE PROPERTY WITH NOTICE DETAILS ===');
    console.log('County:', sampleWithNotice.county);
    console.log('Parcel ID:', sampleWithNotice.parcelId);
    console.log('Address:', sampleWithNotice.address);
    console.log('Owner:', sampleWithNotice.owner);
    console.log('Case Number:', sampleWithNotice.caseNumber);
    console.log('Deed Book/Page:', sampleWithNotice.deedBookPage);
    console.log('Deposit Required:', sampleWithNotice.depositRequired);
    console.log('Legal Description:', sampleWithNotice.legalDescription?.substring(0, 200) + '...');
    console.log('Notice Text Length:', sampleWithNotice.noticeText?.length, 'characters');
  } else {
    console.log('⚠️  No properties with notice details found');
  }
  
  // Count how many properties have notice details
  const withNotices = properties.filter(p => p.noticeText).length;
  console.log(`\n📊 Properties with notice details: ${withNotices}/${properties.length} (${Math.round(withNotices/properties.length*100)}%)`);
  
  // Show breakdown by county
  const countiesCounts = {};
  properties.forEach(p => {
    countiesCounts[p.county] = (countiesCounts[p.county] || 0) + 1;
  });
  
  console.log('\n📍 County breakdown:');
  Object.entries(countiesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([county, count]) => {
      console.log(`  ${county}: ${count} properties`);
    });
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
