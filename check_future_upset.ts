import { scrapeHutchens } from './scrapers/hutchens_scraper';

async function check() {
  const properties = await scrapeHutchens();
  const now = new Date();
  
  // Find properties with future upset deadlines
  const futureUpset = properties.filter(p => 
    p.upsetDeadline && p.upsetDeadline > now
  );
  
  console.log(`\nProperties with FUTURE upset deadlines (should be in_upset_period): ${futureUpset.length}\n`);
  
  futureUpset.forEach(p => {
    console.log(`County: ${p.county}`);
    console.log(`Address: ${p.address}`);
    console.log(`Upset Deadline: ${p.upsetDeadline?.toLocaleDateString()}`);
    console.log(`Status: ${p.saleStatus}`);
    console.log(`---`);
  });
}

check().then(() => process.exit(0));
