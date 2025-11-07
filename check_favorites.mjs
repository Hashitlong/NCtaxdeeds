import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const result = await connection.query(`
  SELECT 
    f.id as fav_id,
    f.propertyId as stored_property_id,
    p.id as actual_property_id,
    p.address,
    p.county,
    CASE WHEN p.id IS NULL THEN 'ORPHANED' ELSE 'MATCHED' END as status
  FROM favorites f
  LEFT JOIN properties p ON f.propertyId = p.id
  ORDER BY f.id
`);

console.log('Favorites Analysis:');
console.log('===================\n');
console.table(result[0]);

await connection.end();
