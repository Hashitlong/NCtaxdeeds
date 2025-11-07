// Direct database password update script
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";

const SALT_ROUNDS = 12;

async function updatePasswords() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  let connection;
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('✅ Connected to database');

    // Hash the passwords
    const rogerPasswordHash = await bcrypt.hash("Brady1018*", SALT_ROUNDS);
    const treyPasswordHash = await bcrypt.hash("password123", SALT_ROUNDS);

    console.log('🔐 Updating Roger\'s password...');
    await connection.execute(
      'UPDATE users SET passwordHash = ? WHERE email = ?',
      [rogerPasswordHash, 'Rogerprw@gmail.com']
    );

    console.log('🔐 Updating Trey\'s password...');
    await connection.execute(
      'UPDATE users SET passwordHash = ? WHERE email = ?',
      [treyPasswordHash, 'trey@titanrealty.com']
    );

    // Verify the updates
    console.log('✅ Verifying password updates...');
    const [rogerResult] = await connection.execute(
      'SELECT email, passwordHash IS NOT NULL as hasPassword FROM users WHERE email = ?',
      ['Rogerprw@gmail.com']
    );
    
    const [treyResult] = await connection.execute(
      'SELECT email, passwordHash IS NOT NULL as hasPassword FROM users WHERE email = ?',
      ['trey@titanrealty.com']
    );

    console.log('Roger:', rogerResult[0]);
    console.log('Trey:', treyResult[0]);

    console.log('🎉 Password update complete!');
    
  } catch (error) {
    console.error('❌ Password update failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

updatePasswords().catch(console.error);