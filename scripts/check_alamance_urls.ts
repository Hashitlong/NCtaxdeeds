import { drizzle } from 'drizzle-orm/mysql2';

async function checkAlamanceUrls() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const result = await db.execute(`
    SELECT id, county, address, parcelId, sourceType, sourceUrl
    FROM properties
    WHERE county = 'Alamance' AND (sourceUrl IS NULL OR sourceUrl = '')
    LIMIT 15
  `);
  
  console.log('\nAlamance properties without sourceUrl:');
  console.log('======================================');
  for (const row of result[0] as any[]) {
    console.log(`ID ${row.id}: ${row.address} (${row.parcelId})`);
    console.log(`  sourceType: ${row.sourceType}, sourceUrl: ${row.sourceUrl}`);
  }
  
  // Also check Cabarrus
  const cabarrusResult = await db.execute(`
    SELECT id, county, address, parcelId, sourceType, sourceUrl
    FROM properties
    WHERE county = 'Cabarrus' AND (sourceUrl IS NULL OR sourceUrl = '')
    LIMIT 10
  `);
  
  console.log('\nCabarrus properties without sourceUrl:');
  console.log('======================================');
  for (const row of cabarrusResult[0] as any[]) {
    console.log(`ID ${row.id}: ${row.address} (${row.parcelId})`);
    console.log(`  sourceType: ${row.sourceType}, sourceUrl: ${row.sourceUrl}`);
  }
  
  process.exit(0);
}

checkAlamanceUrls();
