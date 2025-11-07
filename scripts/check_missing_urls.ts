import { drizzle } from 'drizzle-orm/mysql2';

async function checkMissingUrls() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  // Check Hutchens properties without sourceUrl
  const hutchensResult = await db.execute(`
    SELECT id, county, address, parcelId
    FROM properties
    WHERE sourceType = 'hutchens' AND (sourceUrl IS NULL OR sourceUrl = '')
    LIMIT 5
  `);
  
  console.log('\nHutchens properties without sourceUrl:');
  console.log('======================================');
  for (const row of hutchensResult[0] as any[]) {
    console.log(`ID ${row.id}: ${row.county} - ${row.address} (${row.parcelId})`);
  }
  
  // Check county websites without sourceUrl - group by county
  const countyResult = await db.execute(`
    SELECT county, COUNT(*) as count
    FROM properties
    WHERE sourceType = 'county_website' AND (sourceUrl IS NULL OR sourceUrl = '')
    GROUP BY county
    ORDER BY count DESC
  `);
  
  console.log('\nCounty websites without sourceUrl:');
  console.log('===================================');
  for (const row of countyResult[0] as any[]) {
    console.log(`${row.county}: ${row.count} properties`);
  }
  
  process.exit(0);
}

checkMissingUrls();
