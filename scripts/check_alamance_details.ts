import { drizzle } from 'drizzle-orm/mysql2';

async function checkAlamanceDetails() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const result = await db.execute(`
    SELECT id, county, address, parcelId, sourceType, sourceUrl
    FROM properties
    WHERE county = 'Alamance' AND (sourceUrl IS NULL OR sourceUrl = '')
    LIMIT 5
  `);
  
  console.log('\nAlamance properties without sourceUrl:');
  console.log('======================================');
  for (const row of result[0] as any[]) {
    console.log(`\nID ${row.id}:`);
    console.log(`  Address: ${row.address}`);
    console.log(`  Parcel: ${row.parcelId}`);
    console.log(`  sourceType: ${row.sourceType}`);
    console.log(`  sourceUrl: ${row.sourceUrl}`);
  }
  
  process.exit(0);
}

checkAlamanceDetails();
