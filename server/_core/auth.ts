import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const SALT_ROUNDS = 12;

export function registerAuthRoutes(app: Express) {
  // Registration disabled - users must be created by admin
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    res.status(403).json({ error: "Registration is disabled. Contact your administrator for access." });
  });

  // Login user
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Find user
      const user = await db.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId!, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ 
        success: true, 
        user: { 
          email: user.email, 
          name: user.name || user.email,
          role: user.role 
        } 
      });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout user
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      res.json({
        success: true,
        user: {
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}