import { getDb } from './server/db';
import { properties } from './drizzle/schema';
import { sql } from 'drizzle-orm';

async function checkCoverage() {
  console.log('=== ACTUAL COUNTY COVERAGE IN DATABASE ===\n');
  
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  // Get all unique counties with active properties
  const counties = await db
    .select({ 
      county: properties.county,
      count: sql<number>`COUNT(*)`.as('count')
    })
    .from(properties)
    .where(sql`${properties.isActive} = 1`)
    .groupBy(properties.county)
    .orderBy(properties.county);

  console.log(`Total Counties: ${counties.length}\n`);
  console.log('County List:');
  counties.forEach((c, i) => {
    console.log(`${i + 1}. ${c.county} (${c.count} properties)`);
  });

  console.log(`\n=== SUMMARY ===`);
  console.log(`Counties with active properties: ${counties.length}`);
  console.log(`Total active properties: ${counties.reduce((sum, c) => sum + Number(c.count), 0)}`);
}

checkCoverage().catch(console.error);
