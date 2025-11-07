import { scrapeHokeCounty } from './scrapers/hoke_county_scraper.ts';

async function test() {
  try {
    console.log('Testing Hoke County scraper...\n');
    const properties = await scrapeHokeCounty();
    
    console.log(`\n✅ Successfully scraped ${properties.length} properties\n`);
    
    // Show first 5 properties as examples
    properties.slice(0, 5).forEach((prop, i) => {
      console.log(`Property ${i + 1}:`);
      console.log(`  Address: ${prop.address}`);
      console.log(`  Parcel: ${prop.parcelId}`);
      console.log(`  Status: ${prop.saleStatus}`);
      console.log(`  Sale Date: ${prop.saleDate || 'TBD'}`);
      console.log(`  Opening Bid: ${prop.openingBid ? `$${prop.openingBid.toLocaleString()}` : 'TBD'}`);
      console.log(`  Current Bid: ${prop.currentBid ? `$${prop.currentBid.toLocaleString()}` : 'N/A'}`);
      console.log(`  Case: ${prop.caseNumber || 'TBD'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
