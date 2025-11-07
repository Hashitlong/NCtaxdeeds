import { scrapeMcDowellCounty } from './scrapers/mcdowell_county_scraper';

async function test() {
  console.log('Testing McDowell County scraper...');
  const properties = await scrapeMcDowellCounty();
  console.log(`\nFound ${properties.length} properties:`);
  properties.forEach(p => {
    console.log(`- ${p.address} (Parcel: ${p.parcelId})`);
    console.log(`  Sale Date: ${p.saleDate}`);
    console.log(`  Upset Deadline: ${p.upsetDeadline}`);
    console.log(`  Opening Bid: $${p.openingBid}`);
    console.log(`  Status: ${p.saleStatus}`);
    console.log(`  Case: ${p.caseNumber}`);
  });
}

test().catch(console.error);
