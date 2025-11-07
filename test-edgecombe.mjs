import { scrapeEdgecombeCounty } from './scrapers/edgecombe_county_scraper.ts';

async function test() {
  try {
    console.log('Testing Edgecombe County scraper...\n');
    const properties = await scrapeEdgecombeCounty();
    
    console.log(`\n✅ Successfully scraped ${properties.length} properties\n`);
    
    // Show first 3 properties as examples
    properties.slice(0, 3).forEach((prop, i) => {
      console.log(`Property ${i + 1}:`);
      console.log(`  Address: ${prop.address}`);
      console.log(`  Parcel: ${prop.parcelId}`);
      console.log(`  Status: ${prop.saleStatus}`);
      console.log(`  Sale Date: ${prop.saleDate || 'N/A'}`);
      console.log(`  Case: ${prop.caseNumber || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
