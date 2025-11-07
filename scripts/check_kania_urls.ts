import { drizzle } from 'drizzle-orm/mysql2';

async function checkKaniaUrls() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const result = await db.execute(`
    SELECT id, county, address, sourceType, sourceUrl
    FROM properties
    WHERE sourceType = 'kania'
    LIMIT 10
  `);
  
  console.log('\nFirst 10 Kania properties:');
  console.log('==========================');
  for (const row of result[0] as any[]) {
    console.log(`ID ${row.id}: ${row.county} - ${row.address}`);
    console.log(`  sourceUrl: ${row.sourceUrl || '(NULL)'}`);
  }
  
  process.exit(0);
}

checkKaniaUrls();
