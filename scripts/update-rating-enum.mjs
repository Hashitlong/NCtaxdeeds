/**
 * Update teamRating enum to include new values
 * Run this with: node scripts/update-rating-enum.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function updateRatingEnum() {
  console.log('🔄 Connecting to database...');
  
  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  try {
    // Create connection
    const connection = await mysql.createConnection(databaseUrl);
    console.log('✅ Connected to database');
    
    // Run the migration
    console.log('🔄 Updating teamRating enum...');
    await connection.execute(`
      ALTER TABLE \`properties\` 
      MODIFY COLUMN \`teamRating\` 
      ENUM('good', 'bad', 'watching', 'needs_viewed', 'viewed')
    `);
    
    console.log('✅ Successfully updated teamRating enum!');
    console.log('   New values: good, bad, watching, needs_viewed, viewed');
    
    // Close connection
    await connection.end();
    console.log('✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    process.exit(1);
  }
}

updateRatingEnum();