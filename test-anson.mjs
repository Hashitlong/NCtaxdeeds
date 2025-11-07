import { scrapeAnsonCounty } from './scrapers/anson_county_scraper.ts';

async function test() {
  try {
    console.log('Testing Anson County PDF scraper...\n');
    const properties = await scrapeAnsonCounty();
    
    console.log(`\n✅ Successfully scraped ${properties.length} properties\n`);
    
    properties.forEach((prop, i) => {
      console.log(`Property ${i + 1}:`);
      console.log(`  Owner: ${prop.owner}`);
      console.log(`  Parcel: ${prop.parcelId}`);
      console.log(`  Opening Bid: ${prop.openingBid ? `$${prop.openingBid.toLocaleString()}` : 'N/A'}`);
      console.log(`  Sale Date: ${prop.saleDate || 'TBD'}`);
      console.log(`  Acreage: ${prop.legalDescription || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
