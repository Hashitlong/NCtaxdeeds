import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Find McDowell duplicates
const [dups] = await connection.execute(`
  SELECT county, address, parcelId, GROUP_CONCAT(id ORDER BY id) as ids
  FROM properties
  WHERE county = 'McDowell'
  GROUP BY county, address, parcelId
  HAVING COUNT(*) > 1
`);

console.log(`Found ${dups.length} duplicate groups in McDowell`);

let totalDeleted = 0;

for (const dup of dups) {
  const ids = dup.ids.split(',');
  // Keep the first ID, delete the rest
  const idsToDelete = ids.slice(1);
  
  if (idsToDelete.length > 0) {
    const placeholders = idsToDelete.map(() => '?').join(',');
    const [result] = await connection.execute(
      `DELETE FROM properties WHERE id IN (${placeholders})`,
      idsToDelete
    );
    totalDeleted += result.affectedRows;
    console.log(`Deleted ${result.affectedRows} duplicates for: ${dup.address}`);
  }
}

console.log(`Total deleted: ${totalDeleted}`);

await connection.end();
