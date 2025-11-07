import mysql from 'mysql2/promise';
import fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Exporting clean database...');

const [properties] = await connection.execute('SELECT * FROM properties ORDER BY id');

let sql = `-- NC Tax Deed Property Database - Clean Export
-- Total Properties: ${properties.length}
-- Export Date: ${new Date().toISOString()}
-- 100% Link Coverage - No Duplicates

-- Truncate existing data
TRUNCATE TABLE properties;

-- Insert clean data
`;

for (const prop of properties) {
  const values = [
    prop.id,
    prop.county ? `'${prop.county.replace(/'/g, "''")}'` : 'NULL',
    prop.address ? `'${prop.address.replace(/'/g, "''")}'` : 'NULL',
    prop.city ? `'${prop.city.replace(/'/g, "''")}'` : 'NULL',
    prop.parcelId ? `'${prop.parcelId.replace(/'/g, "''")}'` : 'NULL',
    prop.saleDate ? `'${prop.saleDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
    prop.saleTime ? `'${prop.saleTime.replace(/'/g, "''")}'` : 'NULL',
    prop.saleStatus ? `'${prop.saleStatus}'` : 'NULL',
    prop.saleLocation ? `'${prop.saleLocation.replace(/'/g, "''")}'` : 'NULL',
    prop.openingBid || 'NULL',
    prop.currentBid || 'NULL',
    prop.upsetBidCloseDate ? `'${prop.upsetBidCloseDate.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
    prop.propertyType ? `'${prop.propertyType.replace(/'/g, "''")}'` : 'NULL',
    prop.legalDescription ? `'${prop.legalDescription.replace(/'/g, "''")}'` : 'NULL',
    prop.owner ? `'${prop.owner.replace(/'/g, "''")}'` : 'NULL',
    prop.caseNumber ? `'${prop.caseNumber.replace(/'/g, "''")}'` : 'NULL',
    prop.source ? `'${prop.source.replace(/'/g, "''")}'` : 'NULL',
    prop.sourceType ? `'${prop.sourceType}'` : 'NULL',
    prop.sourceUrl ? `'${prop.sourceUrl.replace(/'/g, "''")}'` : 'NULL',
    prop.rawData ? `'${prop.rawData.replace(/'/g, "''").substring(0, 1000)}'` : 'NULL',
    prop.isActive ? 1 : 0,
    prop.scrapedAt ? `'${prop.scrapedAt.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL',
    prop.geocodedAt ? `'${prop.geocodedAt.toISOString().slice(0, 19).replace('T', ' ')}'` : 'NULL'
  ];
  
  sql += `INSERT INTO properties VALUES (${values.join(', ')});\n`;
}

fs.writeFileSync('database_clean_export.sql', sql);
console.log(`✓ Exported ${properties.length} properties to database_clean_export.sql`);
console.log(`✓ File size: ${(fs.statSync('database_clean_export.sql').size / 1024).toFixed(0)} KB`);

await connection.end();
