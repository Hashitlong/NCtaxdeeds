import fs from 'fs';
import { ScraperService } from './server/scraperService.ts';

console.log('Debugging ZLS import with first 5 properties...\n');

// Read scraped properties
const allProperties = JSON.parse(fs.readFileSync('/home/ubuntu/zls-properties.json', 'utf-8'));
const properties = allProperties.slice(0, 5);

console.log(`Testing with ${properties.length} properties`);
console.log('First property:', JSON.stringify(properties[0], null, 2));

// Create scraper service
const service = new ScraperService();

// Import properties
console.log('\nImporting into database...');
try {
  const result = await service.importProperties(properties, 'zls');
  console.log('\n✅ Import complete!');
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('\n❌ Import failed:', error);
}
