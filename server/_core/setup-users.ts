import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
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
    password: "taxliens123",
    role: "user" as const
  }
];

export function registerSetupRoute(app: Express) {
  // One-time setup endpoint - should be removed after use
  app.post("/api/internal/setup-users", async (req: Request, res: Response) => {
    try {
      // Simple security check
      const secret = req.headers['x-setup-secret'] || req.body.secret;
      const expectedSecret = process.env.SETUP_SECRET || 'setup-users-2024';
      
      if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log('[Setup] Starting user setup...');
      const results = [];

      for (const member of TEAM_MEMBERS) {
        try {
          console.log(`[Setup] Processing: ${member.email}`);
          
          // Check if user exists
          const existingUser = await db.getUserByEmail(member.email);
          
          // Hash password
          const passwordHash = await bcrypt.hash(member.password, SALT_ROUNDS);

          if (existingUser) {
            console.log(`[Setup] Updating existing user: ${member.email}`);
            await db.upsertUser({
              openId: existingUser.openId!,
              email: member.email,
              name: member.name,
              passwordHash,
              loginMethod: "email",
              role: member.role,
            });
            results.push({ email: member.email, status: 'updated' });
          } else {
            console.log(`[Setup] Creating new user: ${member.email}`);
            const openId = nanoid();
            await db.upsertUser({
              openId,
              email: member.email,
              name: member.name,
              passwordHash,
              loginMethod: "email",
              role: member.role,
              lastSignedIn: new Date(),
            });
            results.push({ email: member.email, status: 'created' });
          }
        } catch (error) {
          console.error(`[Setup] Failed to process ${member.email}:`, error);
          results.push({ email: member.email, status: 'failed', error: String(error) });
        }
      }

      console.log('[Setup] User setup complete');
      res.json({ 
        success: true, 
        results,
        message: 'Users have been set up. Please remove this endpoint for security.'
      });
    } catch (error) {
      console.error('[Setup] Setup failed:', error);
      res.status(500).json({ error: 'Setup failed', details: String(error) });
    }
  });
}