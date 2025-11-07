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
}