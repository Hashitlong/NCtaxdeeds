import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Check if propertyNotes table exists and has data
const [tables] = await connection.execute("SHOW TABLES LIKE 'propertyNotes'");
console.log('propertyNotes table exists:', tables.length > 0);

if (tables.length > 0) {
  const [count] = await connection.execute('SELECT COUNT(*) as count FROM propertyNotes');
  console.log('Total notes in database:', count[0].count);
  
  const [sample] = await connection.execute('SELECT * FROM propertyNotes LIMIT 3');
  console.log('\nSample notes:');
  console.log(JSON.stringify(sample, null, 2));
}

await connection.end();
