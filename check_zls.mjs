import { scrapeZLS } from './scrapers/zls_scraper.ts';

const props = await scrapeZLS();
const counties = [...new Set(props.map(p => p.county))].sort();
console.log(`ZLS covers ${counties.length} counties:`);
counties.forEach(c => console.log(`  - ${c}`));
console.log(`\nTotal properties: ${props.length}`);
