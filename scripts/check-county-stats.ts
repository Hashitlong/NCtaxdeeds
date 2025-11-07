/**
 * Script to check county coverage statistics
 */

import { getDb } from '../server/db';
import { properties } from '../drizzle/schema';
import { sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  // Get distinct county count
  const countResult = await db
    .select({
      counties_with_properties: sql<number>`COUNT(DISTINCT county)`,
      total_properties: sql<number>`COUNT(*)`,
    })
    .from(properties)
    .where(sql`isActive = 1`);

  console.log('\n=== COUNTY COVERAGE STATISTICS ===\n');
  console.log(`Counties with properties: ${countResult[0].counties_with_properties}`);
  console.log(`Total active properties: ${countResult[0].total_properties}`);
  console.log(`\nDocumented coverage: 64 counties (from scrapers)`);
  console.log(`Total NC counties: 100`);
  
  // Get property count per county
  const countyStats = await db
    .select({
      county: properties.county,
      property_count: sql<number>`COUNT(*)`,
    })
    .from(properties)
    .where(sql`isActive = 1`)
    .groupBy(properties.county)
    .orderBy(sql`COUNT(*) DESC`);

  console.log('\n=== PROPERTIES PER COUNTY ===\n');
  countyStats.forEach((stat, index) => {
    console.log(`${index + 1}. ${stat.county}: ${stat.property_count} properties`);
  });
  
  console.log(`\n✅ Total: ${countyStats.length} counties with active properties`);
}

main();
