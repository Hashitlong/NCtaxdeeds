import type { Express, Request, Response } from "express";
import mysql from "mysql2/promise";

const WHITELIST_EMAILS = [
  {
    email: "Rogerprw@gmail.com",
    role: "admin"
  },
  {
    email: "trey@titanrealty.com",
    role: "user"
  }
];

export function registerWhitelistRoute(app: Express) {
  app.post("/api/internal/add-whitelist", async (req: Request, res: Response) => {
    try {
      const secret = req.headers['x-setup-secret'] || req.body.secret;
      const expectedSecret = process.env.SETUP_SECRET || 'setup-users-2024';
      
      if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL not configured' });
      }

      console.log('[Whitelist] Connecting to database...');
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      
      const results = [];

      for (const entry of WHITELIST_EMAILS) {
        try {
          console.log(`[Whitelist] Adding: ${entry.email}`);
          
          // Check if already exists
          const [existing] = await connection.execute(
            'SELECT id FROM allowedUsers WHERE email = ?',
            [entry.email]
          );

          if (Array.isArray(existing) && existing.length > 0) {
            console.log(`[Whitelist] Already exists: ${entry.email}`);
            results.push({ email: entry.email, status: 'already_exists' });
          } else {
            // Insert new entry
            await connection.execute(
              `INSERT INTO allowedUsers (email, role, addedBy, createdAt)
               VALUES (?, ?, 'system', NOW())`,
              [entry.email, entry.role]
            );
            
            results.push({ email: entry.email, status: 'added' });
            console.log(`[Whitelist] Added: ${entry.email}`);
          }
        } catch (error) {
          console.error(`[Whitelist] Failed to add ${entry.email}:`, error);
          results.push({ 
            email: entry.email, 
            status: 'failed', 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      await connection.end();
      console.log('[Whitelist] Complete');

      res.json({ 
        success: true, 
        results,
        message: 'Whitelist entries added. You can now log in!'
      });
    } catch (error) {
      console.error('[Whitelist] Failed:', error);
      res.status(500).json({ 
        error: 'Whitelist addition failed', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}