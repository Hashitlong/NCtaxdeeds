import { drizzle } from 'drizzle-orm/mysql2';

async function checkSourceUrls() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  const result = await db.execute(`
    SELECT 
      COUNT(*) as total_properties,
      SUM(CASE WHEN sourceUrl IS NULL OR sourceUrl = '' THEN 1 ELSE 0 END) as no_url,
      SUM(CASE WHEN sourceUrl IS NOT NULL AND sourceUrl != '' THEN 1 ELSE 0 END) as has_url
    FROM properties
  `);
  
  console.log('\nProperties with/without sourceUrl:');
  console.log('===================================');
  const row = result[0][0] as any;
  console.log(`Total properties: ${row.total_properties}`);
  console.log(`No sourceUrl: ${row.no_url}`);
  console.log(`Has sourceUrl: ${row.has_url}`);
  
  // Also check by sourceType
  const byType = await db.execute(`
    SELECT 
      sourceType,
      COUNT(*) as count,
      SUM(CASE WHEN sourceUrl IS NULL OR sourceUrl = '' THEN 1 ELSE 0 END) as no_url
    FROM properties
    GROUP BY sourceType
    ORDER BY count DESC
  `);
  
  console.log('\nBy sourceType:');
  console.log('==============');
  for (const row of byType[0] as any[]) {
    console.log(`${row.sourceType}: ${row.count} properties (${row.no_url} without URL)`);
  }
  
  process.exit(0);
}

checkSourceUrls();
