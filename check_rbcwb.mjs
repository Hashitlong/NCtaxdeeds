import { scrapeRBCWB } from './scrapers/rbcwb_scraper.ts';

const props = await scrapeRBCWB();
const counties = [...new Set(props.map(p => p.county))].sort();
console.log(`RBCWB covers ${counties.length} counties:`);
counties.forEach(c => console.log(`  - ${c}`));
console.log(`\nTotal properties: ${props.length}`);
