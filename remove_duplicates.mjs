import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Finding duplicates...');

// Find all duplicate groups
const [duplicates] = await connection.execute(`
  SELECT county, address, parcelId, GROUP_CONCAT(id ORDER BY id) as ids, COUNT(*) as count
  FROM properties
  GROUP BY county, address, parcelId
  HAVING count > 1
`);

console.log(`Found ${duplicates.length} duplicate groups`);

let totalDeleted = 0;

for (const dup of duplicates) {
  const ids = dup.ids.split(',');
  // Keep the first ID (oldest), delete the rest
  const idsToDelete = ids.slice(1);
  
  if (idsToDelete.length > 0) {
    const placeholders = idsToDelete.map(() => '?').join(',');
    const [result] = await connection.execute(
      `DELETE FROM properties WHERE id IN (${placeholders})`,
      idsToDelete
    );
    totalDeleted += result.affectedRows;
    console.log(`Deleted ${result.affectedRows} duplicates for: ${dup.county} - ${dup.address}`);
  }
}

console.log(`\nTotal duplicates removed: ${totalDeleted}`);

// Verify no duplicates remain
const [remaining] = await connection.execute(`
  SELECT COUNT(*) as count
  FROM (
    SELECT county, address, parcelId, COUNT(*) as cnt
    FROM properties
    GROUP BY county, address, parcelId
    HAVING cnt > 1
  ) as dups
`);

console.log(`Remaining duplicates: ${remaining[0].count}`);

await connection.end();
