// Railway-compatible script to add team members
// Run this via Railway CLI: railway run node scripts/railway-add-team-members.mjs

import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import mysql from "mysql2/promise";

const SALT_ROUNDS = 12;

const TEAM_MEMBERS = [
  {
    email: "Rogerprw@gmail.com",
    name: "Roger Johnson",
    password: "Brady1018*",
    role: "admin"
  },
  {
    email: "trey@titanrealty.com",
    name: "Trey Hamrick",
    password: "taxliens123",
    role: "user"
  }
];

async function addTeamMember(connection, member) {
  try {
    console.log(`Processing team member: ${member.email}`);

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [member.email]
    );

    // Hash password
    const passwordHash = await bcrypt.hash(member.password, SALT_ROUNDS);

    if (existingUsers.length > 0) {
      console.log(`🔄 User exists, updating: ${member.email}`);
      
      const existingUser = existingUsers[0];
      
      // Update existing user
      await connection.execute(
        `UPDATE users SET 
         name = COALESCE(?, name), 
         passwordHash = ?, 
         loginMethod = 'email',
         role = COALESCE(?, role)
         WHERE email = ?`,
        [member.name, passwordHash, member.role, member.email]
      );
      
      console.log(`✅ Successfully updated: ${member.email}`);
    } else {
      console.log(`➕ Creating new user: ${member.email}`);
      
      // Create new user
      const openId = nanoid();
      await connection.execute(
        `INSERT INTO users (openId, email, name, passwordHash, loginMethod, role, lastSignedIn, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, 'email', ?, NOW(), NOW(), NOW())`,
        [openId, member.email, member.name, passwordHash, member.role || 'user']
      );

      console.log(`✅ Successfully created: ${member.email}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to process ${member.email}:`, error);
    return false;
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  let connection;
  try {
    console.log('🔗 Connecting to database...');
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('✅ Connected to database');

    console.log(`\n🚀 Adding ${TEAM_MEMBERS.length} team members...\n`);
    
    let successCount = 0;
    for (const member of TEAM_MEMBERS) {
      const success = await addTeamMember(connection, member);
      if (success) successCount++;
      console.log(''); // Add spacing
    }
    
    console.log(`\n📊 Summary: ${successCount}/${TEAM_MEMBERS.length} team members processed successfully`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

main().catch(console.error);