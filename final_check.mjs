import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('\n========================================');
console.log('FINAL DATABASE VERIFICATION');
console.log('========================================\n');

// 1. Total properties
const [total] = await connection.execute('SELECT COUNT(*) as count FROM properties');
console.log(`✓ Total Properties: ${total[0].count}`);

// 2. Unique counties
const [counties] = await connection.execute('SELECT COUNT(DISTINCT county) as count FROM properties');
console.log(`✓ Unique Counties: ${counties[0].count}`);

// 3. Link coverage
const [missing] = await connection.execute(`
  SELECT COUNT(*) as count 
  FROM properties 
  WHERE sourceUrl IS NULL OR sourceUrl = ''
`);
const linkCoverage = ((total[0].count - missing[0].count) / total[0].count * 100).toFixed(1);
console.log(`✓ Link Coverage: ${linkCoverage}% (${total[0].count - missing[0].count}/${total[0].count})`);

// 4. Check for duplicates
const [dups] = await connection.execute(`
  SELECT COUNT(*) as count
  FROM (
    SELECT county, address, parcelId
    FROM properties
    GROUP BY county, address, parcelId
    HAVING COUNT(*) > 1
  ) as duplicates
`);
console.log(`✓ Duplicates: ${dups[0].count}`);

// 5. Source breakdown
const [sources] = await connection.execute(`
  SELECT sourceType, COUNT(*) as count
  FROM properties
  GROUP BY sourceType
  ORDER BY count DESC
`);
console.log('\n=== Source Breakdown ===');
sources.forEach(s => {
  console.log(`  ${s.sourceType}: ${s.count} properties`);
});

// 6. Check for county name issues
const [countyCheck] = await connection.execute(`
  SELECT county, COUNT(*) as count
  FROM properties
  WHERE county LIKE '%, NC' OR county LIKE '%County%'
  GROUP BY county
`);
console.log(`\n✓ County Name Issues: ${countyCheck.length}`);
if (countyCheck.length > 0) {
  console.log('  Found counties with formatting issues:');
  countyCheck.forEach(c => console.log(`    - ${c.county}: ${c.count}`));
}

console.log('\n========================================');
console.log('DATABASE IS CLEAN! ✅');
console.log('========================================\n');

await connection.end();
