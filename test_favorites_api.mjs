import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Import schema
const favoritesTable = {
  id: 'id',
  userId: 'userId',
  propertyId: 'propertyId',
  createdAt: 'createdAt'
};

const propertiesTable = {
  id: 'id',
  address: 'address',
  county: 'county'
};

// Get Roger's user ID (assuming he's user 1 or find by email)
const [users] = await connection.query(`SELECT id, name, email FROM users WHERE email = 'Rogerprw@gmail.com'`);
console.log('Roger user:', users[0]);

const rogerId = users[0].id;

// Simulate the favorites.list query
const [result] = await connection.query(`
  SELECT 
    f.id as favoriteId,
    p.*
  FROM favorites f
  INNER JOIN properties p ON f.propertyId = p.id
  WHERE f.userId = ?
`, [rogerId]);

console.log('\n=== Favorites.list result ===');
console.log('Count:', result.length);
console.log('\nProperties:');
result.forEach((row, i) => {
  console.log(`${i + 1}. ID: ${row.id}, Address: ${row.address}, County: ${row.county}`);
});

await connection.end();
