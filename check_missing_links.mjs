import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [missing] = await connection.execute(`
  SELECT id, county, address, sourceType, sourceUrl
  FROM properties 
  WHERE sourceUrl IS NULL OR sourceUrl = ''
`);

console.log(`Found ${missing.length} properties missing sourceUrl:\n`);
missing.forEach(p => {
  console.log(`ID: ${p.id} | County: ${p.county} | Address: ${p.address}`);
  console.log(`  sourceType: ${p.sourceType || 'NULL'} | sourceUrl: ${p.sourceUrl || 'NULL'}\n`);
});

await connection.end();
