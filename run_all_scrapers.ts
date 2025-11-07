import { ScraperService } from './server/scraperService';

async function main() {
  console.log('Starting all scrapers...\n');
  const service = new ScraperService();
  const result = await service.runScraper('all');
  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
