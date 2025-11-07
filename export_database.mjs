import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Get all properties
const [properties] = await connection.execute('SELECT * FROM properties ORDER BY id');

console.log(`Exporting ${properties.length} properties...`);

// Create SQL dump
let sql = `-- NC Tax Deed Property Tracker Database Dump
-- Generated: ${new Date().toISOString()}
-- Total Properties: ${properties.length}

-- Clear existing data
TRUNCATE TABLE properties;

-- Insert properties
`;

for (const prop of properties) {
  const values = [];
  const columns = Object.keys(prop);
  
  for (const col of columns) {
    const val = prop[col];
    if (val === null || val === undefined) {
      values.push('NULL');
    } else if (typeof val === 'string') {
      values.push(`'${val.replace(/'/g, "''")}'`);
    } else if (val instanceof Date) {
      values.push(`'${val.toISOString().slice(0, 19).replace('T', ' ')}'`);
    } else {
      values.push(`'${val}'`);
    }
  }
  
  sql += `INSERT INTO properties (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
}

fs.writeFileSync('database_dump.sql', sql);
console.log('Database exported to database_dump.sql');

await connection.end();
