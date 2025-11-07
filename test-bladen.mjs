import { scrapeBladenCounty } from './scrapers/bladen_county_scraper.ts';

async function test() {
  try {
    console.log('Testing Bladen County PDF scraper...\n');
    const properties = await scrapeBladenCounty();
    
    console.log(`\n✅ Successfully scraped ${properties.length} properties\n`);
    
    // Show first 5 properties as examples
    properties.slice(0, 5).forEach((prop, i) => {
      console.log(`Property ${i + 1}:`);
      console.log(`  Address: ${prop.address}`);
      console.log(`  Parcel: ${prop.parcelId}`);
      console.log(`  Sale Price: ${prop.openingBid ? `$${prop.openingBid.toLocaleString()}` : 'N/A'}`);
      console.log(`  Acreage: ${prop.legalDescription || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
