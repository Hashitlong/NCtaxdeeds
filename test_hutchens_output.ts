import { scrapeHutchens } from './scrapers/hutchens_scraper';

async function test() {
  const properties = await scrapeHutchens();
  
  // Find properties with upset deadlines
  const withUpset = properties.filter(p => p.upsetDeadline);
  
  console.log(`\nTotal properties: ${properties.length}`);
  console.log(`Properties with upset deadline: ${withUpset.length}\n`);
  
  // Show first 5 with upset deadlines
  withUpset.slice(0, 5).forEach(p => {
    console.log(`County: ${p.county}`);
    console.log(`Address: ${p.address}`);
    console.log(`Sale Date: ${p.saleDate?.toLocaleDateString()}`);
    console.log(`Upset Deadline: ${p.upsetDeadline?.toLocaleDateString()}`);
    console.log(`Current Bid: $${p.currentBid}`);
    console.log(`Status: ${p.saleStatus}`);
    console.log(`---`);
  });
}

test().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
