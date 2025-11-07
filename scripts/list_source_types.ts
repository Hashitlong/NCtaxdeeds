import { getDb } from '../server/db.ts';
import { sql } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  const results = await db.execute(sql`SELECT DISTINCT sourceType FROM properties WHERE sourceType IS NOT NULL ORDER BY sourceType`);
  
  console.log('All sourceType values in database:\n');
  results.forEach((row: any) => {
    console.log(`  - ${row.sourceType}`);
  });

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
