import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  const results: any = await db.execute(sql`
    SELECT COUNT(*) as count, sourceType 
    FROM properties 
    GROUP BY sourceType 
    ORDER BY count DESC
  `);

  console.log('\nSourceType Breakdown:');
  console.log('=====================');
  const rows = results[0] || results;
  rows.forEach((row: any) => {
    const type = row.sourceType || 'NULL';
    console.log(`${type.padEnd(20)} ${row.count} properties`);
  });
}

main().then(() => process.exit(0)).catch(console.error);
