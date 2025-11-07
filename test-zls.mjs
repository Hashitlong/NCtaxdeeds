import { scrapeZLS } from './scrapers/zls_scraper.ts';

console.log('Testing ZLS scraper...');

try {
  const properties = await scrapeZLS();
  console.log(`\n✅ Found ${properties.length} properties from ZLS`);
  
  if (properties.length > 0) {
    console.log('\nSample property:');
    console.log(JSON.stringify(properties[0], null, 2));
    
    // Show county breakdown
    const countiesCounts = {};
    properties.forEach(p => {
      countiesCounts[p.county] = (countiesCounts[p.county] || 0) + 1;
    });
    
    console.log('\nCounty breakdown:');
    Object.entries(countiesCounts).forEach(([county, count]) => {
      console.log(`  ${county}: ${count} properties`);
    });
  }
} catch (error) {
  console.error('❌ Error:', error);
}
