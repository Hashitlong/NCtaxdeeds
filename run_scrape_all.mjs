import { ScraperService } from './server/scraperService.ts';

console.log('Running "scrape all" to populate database with all law firm data...\n');

const service = new ScraperService();
const result = await service.runScraper('all');

console.log('\n=== SCRAPE ALL COMPLETE ===');
console.log(`Success: ${result.success}`);
console.log(`Total properties found: ${result.count}`);
if (result.error) {
  console.log(`Error: ${result.error}`);
}
