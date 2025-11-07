import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('\n========================================');
console.log('COMPREHENSIVE DATABASE ANALYSIS');
console.log('========================================\n');

// 1. Properties missing sourceType or sourceUrl
const [missing] = await connection.execute(`
  SELECT county, address, parcelId, sourceType, sourceUrl
  FROM properties 
  WHERE sourceType IS NULL OR sourceType = '' OR sourceUrl IS NULL OR sourceUrl = ''
  LIMIT 20
`);

console.log('=== PROPERTIES MISSING LINKS ===');
if (missing.length === 0) {
  console.log('✅ All properties have links');
} else {
  console.log(`❌ Found ${missing.length}+ properties missing links:`);
  missing.forEach(p => {
    console.log(`  - ${p.county} | ${p.address} | sourceType: ${p.sourceType || 'NULL'} | sourceUrl: ${p.sourceUrl || 'NULL'}`);
  });
}

// 2. Count of properties with missing links
const [missingCount] = await connection.execute(`
  SELECT COUNT(*) as count
  FROM properties 
  WHERE sourceType IS NULL OR sourceType = '' OR sourceUrl IS NULL OR sourceUrl = ''
`);

console.log(`\nTotal properties missing links: ${missingCount[0].count}`);

// 3. County name variations (duplicates)
const [counties] = await connection.execute(`
  SELECT county, COUNT(*) as count
  FROM properties
  GROUP BY county
  ORDER BY county
`);

console.log('\n=== ALL COUNTIES IN DATABASE ===');
console.log('(Looking for duplicates like "Beaufort" vs "Beaufort NC")');
counties.forEach(c => {
  console.log(`  ${c.county}: ${c.count} properties`);
});

// 4. Find potential duplicate counties
console.log('\n=== POTENTIAL DUPLICATE COUNTIES ===');
const countyNames = counties.map(c => c.county);
const duplicates = [];
countyNames.forEach(name => {
  const baseName = name.replace(/ NC$/i, '').trim();
  const withNC = baseName + ' NC';
  const withoutNC = baseName;
  
  if (countyNames.includes(withNC) && countyNames.includes(withoutNC)) {
    if (!duplicates.some(d => d.base === baseName)) {
      duplicates.push({ base: baseName, with: withNC, without: withoutNC });
    }
  }
});

if (duplicates.length === 0) {
  console.log('✅ No obvious county name duplicates found');
} else {
  console.log('❌ Found potential duplicates:');
  duplicates.forEach(d => {
    const withCount = counties.find(c => c.county === d.with)?.count || 0;
    const withoutCount = counties.find(c => c.county === d.without)?.count || 0;
    console.log(`  - "${d.without}" (${withoutCount}) vs "${d.with}" (${withCount})`);
  });
}

// 5. Source breakdown by county
const [sourceByCounty] = await connection.execute(`
  SELECT county, sourceType, COUNT(*) as count
  FROM properties
  GROUP BY county, sourceType
  ORDER BY county, count DESC
`);

console.log('\n=== SCRAPER MAPPING BY COUNTY ===');
console.log('(Which scraper is providing data for each county)\n');

const countyMap = {};
sourceByCounty.forEach(row => {
  if (!countyMap[row.county]) {
    countyMap[row.county] = [];
  }
  countyMap[row.county].push({ source: row.sourceType, count: row.count });
});

Object.keys(countyMap).sort().forEach(county => {
  const sources = countyMap[county];
  const sourceStr = sources.map(s => `${s.source}(${s.count})`).join(', ');
  console.log(`${county}: ${sourceStr}`);
});

// 6. Total summary
const [total] = await connection.execute('SELECT COUNT(*) as total FROM properties');
const [uniqueCounties] = await connection.execute('SELECT COUNT(DISTINCT county) as count FROM properties');

console.log('\n=== SUMMARY ===');
console.log(`Total Properties: ${total[0].total}`);
console.log(`Unique Counties: ${uniqueCounties[0].count}`);
console.log(`Properties with links: ${total[0].total - missingCount[0].count}`);
console.log(`Properties missing links: ${missingCount[0].count}`);
console.log(`Link coverage: ${((total[0].total - missingCount[0].count) / total[0].total * 100).toFixed(1)}%`);

await connection.end();
