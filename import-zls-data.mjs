import fs from 'fs';
import { ScraperService } from './server/scraperService.ts';

console.log('Importing ZLS properties into database...\n');

// Read scraped properties
const properties = JSON.parse(fs.readFileSync('/home/ubuntu/zls-properties.json', 'utf-8'));
console.log(`Loaded ${properties.length} properties from file`);

// Create scraper service
const service = new ScraperService();

// Import properties
console.log('Importing into database...');
const result = await service.importProperties(properties, 'zls');

console.log('\n✅ Import complete!');
console.log('Result:', JSON.stringify(result, null, 2));
