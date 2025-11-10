import type { Express, Request, Response } from "express";
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

export function registerDirectInsertRoute(app: Express) {
  app.post("/api/internal/direct-insert-users", async (req: Request, res: Response) => {
    try {
      // Security check
      const secret = req.headers['x-setup-secret'] || req.body.secret;
      const expectedSecret = process.env.SETUP_SECRET || 'setup-users-2024';
      
      if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL not configured' });
      }

      console.log('[DirectInsert] Connecting to database...');
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      
      const results = [];

      for (const member of TEAM_MEMBERS) {
        try {
          console.log(`[DirectInsert] Processing: ${member.email}`);
          
          // Check if user exists
          const [existingRows] = await connection.execute(
            'SELECT id, email FROM users WHERE email = ?',
            [member.email]
          );
          
          const passwordHash = await bcrypt.hash(member.password, SALT_ROUNDS);
          const openId = nanoid();

          if (Array.isArray(existingRows) && existingRows.length > 0) {
            console.log(`[DirectInsert] User exists, updating: ${member.email}`);
            
            // Update existing user
            await connection.execute(
              `UPDATE users SET 
               name = ?, 
               passwordHash = ?, 
               loginMethod = 'email',
               role = ?,
               updatedAt = NOW()
               WHERE email = ?`,
              [member.name, passwordHash, member.role, member.email]
            );
            
            results.push({ email: member.email, status: 'updated' });
          } else {
            console.log(`[DirectInsert] Creating new user: ${member.email}`);
            
            // Insert new user
            await connection.execute(
              `INSERT INTO users 
               (openId, email, name, passwordHash, loginMethod, role, lastSignedIn, createdAt, updatedAt)
               VALUES (?, ?, ?, ?, 'email', ?, NOW(), NOW(), NOW())`,
              [openId, member.email, member.name, passwordHash, member.role]
            );
            
            results.push({ email: member.email, status: 'created' });
          }
        } catch (error) {
          console.error(`[DirectInsert] Failed to process ${member.email}:`, error);
          results.push({ 
            email: member.email, 
            status: 'failed', 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      await connection.end();
      console.log('[DirectInsert] Complete');

      res.json({ 
        success: true, 
        results,
        message: 'Users have been set up via direct SQL. Please remove this endpoint for security.'
      });
    } catch (error) {
      console.error('[DirectInsert] Failed:', error);
      res.status(500).json({ 
        error: 'Direct insert failed', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}