import type { Express, Request, Response } from "express";
import * as db from "../db";

export function registerDebugRoutes(app: Express) {
  // Debug endpoint to check user existence (temporary)
  app.get("/api/internal/debug-users", async (req: Request, res: Response) => {
    try {
      // Simple security check
      const secret = req.headers['x-debug-secret'] || req.query.secret;
      const expectedSecret = process.env.DEBUG_SECRET || 'debug-users-2024';
      
      if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check for both email variations
      const rogerExact = await db.getUserByEmail("Rogerprw@gmail.com");
      const rogerLower = await db.getUserByEmail("rogerprw@gmail.com");
      const treyExact = await db.getUserByEmail("trey@titanrealty.com");

      res.json({
        users: {
          "Rogerprw@gmail.com": rogerExact ? {
            exists: true,
            email: rogerExact.email,
            name: rogerExact.name,
            hasPassword: !!rogerExact.passwordHash,
            role: rogerExact.role
          } : { exists: false },
          "rogerprw@gmail.com": rogerLower ? {
            exists: true,
            email: rogerLower.email,
            name: rogerLower.name,
            hasPassword: !!rogerLower.passwordHash,
            role: rogerLower.role
          } : { exists: false },
          "trey@titanrealty.com": treyExact ? {
            exists: true,
            email: treyExact.email,
            name: treyExact.name,
            hasPassword: !!treyExact.passwordHash,
            role: treyExact.role
          } : { exists: false }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('[Debug] User check failed:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
}