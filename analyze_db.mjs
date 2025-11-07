import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get source breakdown
const [sources] = await connection.execute(`
  SELECT sourceType, COUNT(*) as count 
  FROM properties 
  GROUP BY sourceType 
  ORDER BY count DESC
`);

console.log('\n=== PROPERTY COUNT BY SOURCE ===');
console.log(sources);

// Get total
const [total] = await connection.execute('SELECT COUNT(*) as total FROM properties');
console.log('\nTotal Properties:', total[0].total);

// Check for duplicates
const [dups] = await connection.execute(`
  SELECT county, address, parcelId, COUNT(*) as count 
  FROM properties 
  GROUP BY county, address, parcelId 
  HAVING count > 1 
  ORDER BY count DESC 
  LIMIT 10
`);

console.log('\n=== DUPLICATE CHECK ===');
if (dups.length === 0) {
  console.log('✅ No duplicates found');
} else {
  console.log('❌ Found duplicates:');
  console.log(dups);
}

// Check properties with missing sourceType
const [missing] = await connection.execute(`
  SELECT COUNT(*) as count 
  FROM properties 
  WHERE sourceType IS NULL OR sourceType = ''
`);

console.log('\n=== SOURCE LINK COVERAGE ===');
console.log('Properties with sourceType:', total[0].total - missing[0].count);
console.log('Properties missing sourceType:', missing[0].count);
console.log('Coverage:', ((total[0].total - missing[0].count) / total[0].total * 100).toFixed(1) + '%');

await connection.end();
