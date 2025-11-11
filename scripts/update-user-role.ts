import { getDb } from '../server/db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function updateUserRole() {
  const email = process.argv[2];
  const role = process.argv[3] as 'admin' | 'user';

  if (!email || !role) {
    console.error('Usage: tsx scripts/update-user-role.ts <email> <admin|user>');
    process.exit(1);
  }

  if (role !== 'admin' && role !== 'user') {
    console.error('Role must be either "admin" or "user"');
    process.exit(1);
  }

  try {
    const db = await getDb();
    if (!db) {
      console.error('Failed to connect to database');
      process.exit(1);
    }
    
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUsers.length === 0) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    const user = existingUsers[0];
    console.log(`Current user: ${user.name} (${user.email}) - Role: ${user.role}`);

    // Update the role
    await db.update(users)
      .set({ role })
      .where(eq(users.email, email));

    console.log(`✅ Successfully updated ${user.name}'s role to: ${role}`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
}

updateUserRole();