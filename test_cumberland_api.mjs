import { ScraperService } from './server/scraperService.ts';

console.log('Testing Cumberland scraper through ScraperService API...\n');

const service = new ScraperService();

try {
  const result = await service.runScraper('cumberland');
  console.log('\nResult:', result);
  
  if (result.success) {
    console.log(`\n✓ Success! Found ${result.count} properties`);
  } else {
    console.log(`\n✗ Failed: ${result.error}`);
  }
} catch (error) {
  console.error('\n✗ Error:', error.message);
}
