import { scrapeKania } from './scrapers/kania_scraper.ts';

const props = await scrapeKania();
const counties = [...new Set(props.map(p => p.county))].sort();
console.log(`Kania covers ${counties.length} counties:`);
counties.forEach(c => console.log(`  - ${c}`));
