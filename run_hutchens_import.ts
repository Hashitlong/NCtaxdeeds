import { ScraperService } from './server/scraperService';

async function main() {
  console.log('Running Hutchens scraper...');
  const service = new ScraperService();
  const result = await service.runScraper('hutchens');
  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
