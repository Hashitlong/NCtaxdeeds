#!/usr/bin/env tsx
/**
 * Apply the saleStatus enum migration to production database
 */

import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  console.log('Applying production database migration...');
  
  if (!process.env.DATABASE_URL && !process.env.MYSQL_URL) {
    console.error('ERROR: DATABASE_URL or MYSQL_URL not set');
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL || process.env.MYSQL_URL;
  console.log('Connecting to database...');

  const connection = await mysql.createConnection(connectionString!);
  
  try {
    console.log('Running migration...');
    await connection.execute(`
      ALTER TABLE properties 
      MODIFY COLUMN saleStatus 
      enum('scheduled','in_upset_period','upset_period','sold','cancelled','pending','postponed') 
      DEFAULT 'scheduled'
    `);
    
    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();