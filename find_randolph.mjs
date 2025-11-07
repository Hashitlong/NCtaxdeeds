import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [result] = await connection.query(`
  SELECT id, address, county, parcelId 
  FROM properties 
  WHERE address LIKE '%546 Woodlawn%' OR county = 'Randolph'
  ORDER BY county, address
  LIMIT 5
`);

console.log('Randolph County properties:');
result.forEach((row, i) => {
  console.log(`${i + 1}. ID: ${row.id}, Address: ${row.address}, County: ${row.county}`);
});

await connection.end();
