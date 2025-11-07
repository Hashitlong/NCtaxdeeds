import { scrapeHutchens } from '../scrapers/hutchens_scraper.ts';
import { importProperties } from '../server/scraperService.ts';

async function main() {
  console.log('Running Hutchens scraper...');
  const properties = await scrapeHutchens();
  console.log(`Scraped ${properties.length} properties from Hutchens Law Firm`);
  
  console.log('\nImporting into database...');
  const result = await importProperties(properties, 'hutchens');
  console.log(`Import complete: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped`);
  
  // Show some examples with bid amounts
  const withBids = properties.filter(p => p.openingBid || p.currentBid).slice(0, 5);
  console.log('\nSample properties with bids:');
  withBids.forEach(p => {
    console.log(`\n${p.address} - ${p.county} County`);
    if (p.openingBid) console.log(`  Opening: $${(p.openingBid/100).toFixed(2)} (${p.openingBid} cents)`);
    if (p.currentBid) console.log(`  Current: $${(p.currentBid/100).toFixed(2)} (${p.currentBid} cents)`);
  });
  
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
