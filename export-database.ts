import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function exportDatabase() {
  const db = drizzle(process.env.DATABASE_URL!);
  
  console.log('Exporting database...');
  
  // Get all table names
  const tables = [
    'properties',
    'users',
    'favorites',
    'savedSearches',
    'propertyNotes',
    'userPreferences',
    'allowedUsers',
    'notificationPreferences',
    'notificationHistory',
    'propertyHistory',
    'scrapeHistory',
    'counties'
  ];
  
  let exportSQL = '-- NC Tax Deed Property Tracker Database Export\n';
  exportSQL += `-- Generated: ${new Date().toISOString()}\n`;
  exportSQL += '-- Total tables: ' + tables.length + '\n\n';
  exportSQL += 'SET FOREIGN_KEY_CHECKS=0;\n\n';
  
  for (const table of tables) {
    try {
      console.log(`Exporting table: ${table}`);
      
      // Get row count
      const countResult: any = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
      const rowCount = countResult[0]?.[0]?.count || 0;
      
      exportSQL += `-- Table: ${table} (${rowCount} rows)\n`;
      exportSQL += `TRUNCATE TABLE ${table};\n`;
      
      if (rowCount > 0) {
        // Get all data
        const rows: any = await db.execute(sql.raw(`SELECT * FROM ${table}`));
        
        if (rows[0] && rows[0].length > 0) {
          const columns = Object.keys(rows[0][0]);
          
          for (const row of rows[0]) {
            const values = columns.map(col => {
              const val = row[col];
              if (val === null) return 'NULL';
              if (val instanceof Date) return `'${val.toISOString()}'`;
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'number') return val;
              if (typeof val === 'boolean') return val ? 1 : 0;
              return `'${String(val).replace(/'/g, "''")}'`;
            });
            
            exportSQL += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
          }
        }
      }
      
      exportSQL += '\n';
    } catch (error) {
      console.error(`Error exporting table ${table}:`, error);
      exportSQL += `-- Error exporting table ${table}: ${error}\n\n`;
    }
  }
  
  exportSQL += 'SET FOREIGN_KEY_CHECKS=1;\n';
  
  // Write to file
  const filename = 'database_export.sql';
  fs.writeFileSync(filename, exportSQL);
  
  const stats = fs.statSync(filename);
  console.log(`\nDatabase exported successfully!`);
  console.log(`File: ${filename}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(2)} KB`);
}

exportDatabase().catch(console.error);
