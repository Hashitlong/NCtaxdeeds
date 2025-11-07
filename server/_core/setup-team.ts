import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import type { Express, Request, Response } from "express";
import * as db from "../db";

const SALT_ROUNDS = 12;

const TEAM_MEMBERS = [
  {
    email: "Rogerprw@gmail.com",
    name: "Roger Johnson",
    password: "Brady1018*",
    role: "admin" as const
  },
  {
    email: "trey@titanrealty.com",
    name: "Trey Hamrick",
    password: "password123",
    role: "user" as const
  }
];

async function addTeamMember(member: typeof TEAM_MEMBERS[0]) {
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
    
    return { success: true, email: member.email };
  } catch (error: any) {
    console.error(`❌ Failed to process ${member.email}:`, error);
    return { success: false, email: member.email, error: error.message };
  }
}

export function registerSetupRoutes(app: Express) {
  // One-time setup endpoint to create team members
  app.post("/api/internal/setup-team", async (req: Request, res: Response) => {
    try {
      // Simple security check
      const secret = req.headers['x-setup-secret'] || req.query.secret;
      const expectedSecret = process.env.SETUP_SECRET || 'setup-team-2024';
      
      if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log(`🚀 Setting up ${TEAM_MEMBERS.length} team members...`);
      
      const results = [];
      for (const member of TEAM_MEMBERS) {
        const result = await addTeamMember(member);
        results.push(result);
      }
      
      const successCount = results.filter(r => r.success).length;
      
      res.json({
        success: true,
        message: `Team setup complete: ${successCount}/${TEAM_MEMBERS.length} members processed`,
        results,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      console.error('[Setup] Team setup failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Direct password update endpoint (bypasses upsertUser bug)
  app.post("/api/internal/fix-passwords", async (req: Request, res: Response) => {
    try {
      const secret = req.headers['x-setup-secret'] || req.query.secret;
      const expectedSecret = process.env.SETUP_SECRET || 'setup-team-2024';
      
      if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log('🔐 Direct password update starting...');
      
      // Import mysql2 and bcrypt directly
      const mysql = await import('mysql2/promise');
      
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL not available');
      }

      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      
      // Hash the passwords
      const rogerPasswordHash = await bcrypt.hash("Brady1018*", SALT_ROUNDS);
      const treyPasswordHash = await bcrypt.hash("password123", SALT_ROUNDS);

      // Update passwords directly in database
      await connection.execute(
        'UPDATE users SET passwordHash = ? WHERE email = ?',
        [rogerPasswordHash, 'Rogerprw@gmail.com']
      );

      await connection.execute(
        'UPDATE users SET passwordHash = ? WHERE email = ?',
        [treyPasswordHash, 'trey@titanrealty.com']
      );

      // Verify the updates
      const [rogerResult] = await connection.execute(
        'SELECT email, passwordHash IS NOT NULL as hasPassword FROM users WHERE email = ?',
        ['Rogerprw@gmail.com']
      ) as any;
      
      const [treyResult] = await connection.execute(
        'SELECT email, passwordHash IS NOT NULL as hasPassword FROM users WHERE email = ?',
        ['trey@titanrealty.com']
      ) as any;

      await connection.end();

      res.json({
        success: true,
        message: "Direct password update complete",
        results: {
          roger: rogerResult[0],
          trey: treyResult[0]
        },
        timestamp: new Date().toISOString(),
      });
      
    } catch (error: any) {
      console.error('[Setup] Direct password update failed:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
}