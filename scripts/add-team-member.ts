import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import * as db from "../server/db";

const SALT_ROUNDS = 12;

interface TeamMember {
  email: string;
  name?: string;
  password: string;
  role?: "admin" | "user";
}

async function addTeamMember(member: TeamMember) {
  try {
    console.log(`Processing team member: ${member.email}`);

    // Check if user already exists
    const existingUser = await db.getUserByEmail(member.email);
    
    // Hash password
    const passwordHash = await bcrypt.hash(member.password, SALT_ROUNDS);

    if (existingUser) {
      console.log(`🔄 User exists, updating: ${member.email}`);
      
      // Update existing user with new password and role
      await db.upsertUser({
        openId: existingUser.openId!,
        email: member.email,
        name: member.name || existingUser.name,
        passwordHash,
        loginMethod: "email",
        role: member.role || existingUser.role || "user",
        lastSignedIn: existingUser.lastSignedIn,
      });
      
      console.log(`✅ Successfully updated: ${member.email}`);
    } else {
      console.log(`➕ Creating new user: ${member.email}`);
      
      // Create new user
      const openId = nanoid();
      await db.upsertUser({
        openId,
        email: member.email,
        name: member.name || null,
        passwordHash,
        loginMethod: "email",
        role: member.role || "user",
        lastSignedIn: new Date(),
      });

      console.log(`✅ Successfully created: ${member.email}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to process ${member.email}:`, error);
    return false;
  }
}

async function addMultipleTeamMembers(members: TeamMember[]) {
  console.log(`\n🚀 Adding ${members.length} team members...\n`);
  
  let successCount = 0;
  for (const member of members) {
    const success = await addTeamMember(member);
    if (success) successCount++;
    console.log(""); // Add spacing
  }
  
  console.log(`\n📊 Summary: ${successCount}/${members.length} team members added successfully`);
}

// Team members to add
const TEAM_MEMBERS: TeamMember[] = [
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

// Run the script
async function main() {
  if (process.argv.length > 2) {
    // Command line usage: npm run add-team-member email@example.com "User Name" password123 admin
    const email = process.argv[2];
    const name = process.argv[3];
    const password = process.argv[4];
    const role = process.argv[5] as "admin" | "user" | undefined;

    if (!email || !password) {
      console.error("Usage: npm run add-team-member <email> [name] <password> [role]");
      process.exit(1);
    }

    await addTeamMember({ email, name, password, role });
  } else {
    // Batch mode - add all team members from the array above
    if (TEAM_MEMBERS.length === 0) {
      console.log("No team members defined. Edit the TEAM_MEMBERS array in this script or use command line arguments.");
      console.log("Usage: npm run add-team-member <email> [name] <password> [role]");
      process.exit(0);
    }
    
    await addMultipleTeamMembers(TEAM_MEMBERS);
  }
  
  process.exit(0);
}

main().catch(console.error);