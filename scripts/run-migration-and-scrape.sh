#!/bin/bash
set -e

echo "Running database migration..."
node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || process.env.MYSQL_URL);
  try {
    await conn.execute(\`
      ALTER TABLE properties 
      MODIFY COLUMN saleStatus 
      enum('scheduled','in_upset_period','upset_period','sold','cancelled','pending','postponed') 
      DEFAULT 'scheduled'
    \`);
    console.log('✅ Migration applied successfully');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate column')) {
      console.log('✅ Migration already applied');
    } else {
      console.error('Migration error:', err.message);
    }
  } finally {
    await conn.end();
  }
})();
"

echo "Starting scrapers..."
npm run scrape