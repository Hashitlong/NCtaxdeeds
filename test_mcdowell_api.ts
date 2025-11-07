import { ScraperService } from './server/scraperService';

async function test() {
  console.log('Testing McDowell County scraper through API...');
  const service = new ScraperService();
  const result = await service.runScraper('mcdowell');
  console.log('\nResult:', result);
}

test().catch(console.error);
