import "dotenv/config";
import * as db from "../server/db";

async function checkExistingUsers() {
  try {
    console.log("🔍 Checking for existing users in the database...\n");

    // Check for existing users with the emails we want to add
    const rogerUser = await db.getUserByEmail("Rogerprw@gmail.com");
    const treyUser = await db.getUserByEmail("trey@titanrealty.com");

    if (rogerUser) {
      console.log("✅ Found existing user: Rogerprw@gmail.com");
      console.log(`   - Name: ${rogerUser.name || "Not set"}`);
      console.log(`   - Role: ${rogerUser.role || "user"}`);
      console.log(`   - Login Method: ${rogerUser.loginMethod || "Not set"}`);
      console.log(`   - Has Password: ${rogerUser.passwordHash ? "Yes" : "No"}`);
      console.log(`   - Last Signed In: ${rogerUser.lastSignedIn || "Never"}`);
      console.log("");
    } else {
      console.log("❌ No existing user found for: Rogerprw@gmail.com");
    }

    if (treyUser) {
      console.log("✅ Found existing user: trey@titanrealty.com");
      console.log(`   - Name: ${treyUser.name || "Not set"}`);
      console.log(`   - Role: ${treyUser.role || "user"}`);
      console.log(`   - Login Method: ${treyUser.loginMethod || "Not set"}`);
      console.log(`   - Has Password: ${treyUser.passwordHash ? "Yes" : "No"}`);
      console.log(`   - Last Signed In: ${treyUser.lastSignedIn || "Never"}`);
      console.log("");
    } else {
      console.log("❌ No existing user found for: trey@titanrealty.com");
    }

    // Check if there are any other users in the system
    console.log("📊 Checking for any other users in the system...");
    
    // We'll need to query the database directly since we don't have a "get all users" function
    const { getDb } = await import("../server/db");
    const { users } = await import("../drizzle/schema");
    
    const database = await getDb();
    if (!database) {
      console.log("❌ Cannot connect to database");
      return;
    }
    
    const allUsers = await database.select().from(users);
    
    if (allUsers.length > 0) {
      console.log(`\n📋 Found ${allUsers.length} total users in the database:`);
      allUsers.forEach((user: any, index: number) => {
        console.log(`${index + 1}. ${user.email} (${user.name || "No name"}) - Role: ${user.role || "user"}`);
      });
    } else {
      console.log("\n📋 No users found in the database");
    }

  } catch (error) {
    console.error("❌ Error checking users:", error);
  }
  
  process.exit(0);
}

checkExistingUsers().catch(console.error);