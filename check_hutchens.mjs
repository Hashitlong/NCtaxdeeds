import { scrapeHutchens } from './scrapers/hutchens_scraper.ts';

const props = await scrapeHutchens();
const counties = [...new Set(props.map(p => p.county))].sort();
console.log(`Hutchens covers ${counties.length} counties:`);
counties.forEach(c => console.log(`  - ${c}`));
