import { scrapeCumberlandCounty } from './scrapers/cumberland_county_scraper.ts';

console.log('Testing Cumberland County scraper...\n');

try {
  const properties = await scrapeCumberlandCounty();
  console.log(`\nSuccess! Found ${properties.length} properties:\n`);
  properties.forEach((prop, i) => {
    console.log(`${i + 1}. ${prop.owner}`);
    console.log(`   Address: ${prop.address}`);
    console.log(`   Parcel: ${prop.parcelId}`);
    console.log(`   Sale Date: ${prop.saleDate}`);
    console.log(`   Status: ${prop.saleStatus}`);
    console.log('');
  });
} catch (error) {
  console.error('Error:', error.message);
}
