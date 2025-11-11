import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Test the note count query
const result = await db.execute(sql`
  SELECT 
    p.id,
    p.address,
    p.county,
    (SELECT COUNT(*) FROM propertyNotes WHERE propertyId = p.id) as noteCount
  FROM properties p
  WHERE p.isActive = 1
  LIMIT 5
`);

console.log('Properties with note counts:');
console.log(JSON.stringify(result[0], null, 2));

await connection.end();
