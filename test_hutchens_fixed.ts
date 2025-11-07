import { scrapeHutchens } from './scrapers/hutchens_scraper';

async function test() {
  const properties = await scrapeHutchens();
  const now = new Date();
  
  // Find properties with upset bid close dates
  const withUpset = properties.filter(p => p.upsetBidCloseDate);
  const futureUpset = withUpset.filter(p => p.upsetBidCloseDate && p.upsetBidCloseDate > now);
  
  console.log(`\nTotal properties: ${properties.length}`);
  console.log(`Properties with upsetBidCloseDate: ${withUpset.length}`);
  console.log(`Properties with FUTURE upset periods: ${futureUpset.length}\n`);
  
  if (futureUpset.length > 0) {
    console.log('Properties currently in upset period:');
    futureUpset.slice(0, 5).forEach(p => {
      console.log(`  ${p.county} - ${p.address}`);
      console.log(`    Upset deadline: ${p.upsetBidCloseDate?.toLocaleDateString()}`);
      console.log(`    Status: ${p.saleStatus}`);
    });
  } else {
    console.log('No properties currently in upset period (all deadlines have passed)');
  }
}

test().then(() => process.exit(0));
