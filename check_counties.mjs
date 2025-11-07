import { drizzle } from 'drizzle-orm/mysql2';
import { properties } from './drizzle/schema.js';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

const result = await db.select({ county: properties.county })
  .from(properties)
  .groupBy(properties.county)
  .orderBy(properties.county);

console.log('Counties currently in database:');
console.log(result.map(r => r.county).join(', '));
console.log(`\nTotal: ${result.length} counties`);
