import { scrapeZLS } from './scrapers/zls_scraper.ts';
import { getDb } from './server/db.ts';

// Get ZLS counties
const zlsProps = await scrapeZLS();
const zlsCounties = [...new Set(zlsProps.map(p => p.county))].sort();

// Get database counties
const db = await getDb();
const dbResult = await db.execute('SELECT DISTINCT county FROM properties ORDER BY county');
const dbCounties = dbResult.rows.map(r => r.county);

// Find new counties
const newCounties = zlsCounties.filter(c => !dbCounties.includes(c));

console.log('\n=== COVERAGE ANALYSIS ===\n');
console.log(`Database has: ${dbCounties.length} counties`);
console.log(`ZLS covers: ${zlsCounties.length} counties`);
console.log(`NEW counties from ZLS: ${newCounties.length}\n`);

if (newCounties.length > 0) {
  console.log('New counties we can add:');
  newCounties.forEach(c => {
    const count = zlsProps.filter(p => p.county === c).length;
    console.log(`  - ${c} (${count} properties)`);
  });
}
