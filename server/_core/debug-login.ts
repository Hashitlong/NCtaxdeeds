import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export function registerDebugLoginRoutes(app: Express) {
  // Debug login with extensive logging
  app.post("/api/auth/debug-login", async (req: Request, res: Response) => {
    try {
      console.log("[Debug Login] Starting login process...");
      const { email, password } = req.body;

      console.log("[Debug Login] Received email:", email);
      console.log("[Debug Login] Password provided:", !!password);

      if (!email || !password) {
        console.log("[Debug Login] Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }

      console.log("[Debug Login] About to call db.getUserByEmail...");
      const startTime = Date.now();
      
      // Find user
      const user = await db.getUserByEmail(email);
      const dbTime = Date.now() - startTime;
      
      console.log("[Debug Login] db.getUserByEmail completed in", dbTime, "ms");
      console.log("[Debug Login] User found:", !!user);
      console.log("[Debug Login] User has passwordHash:", !!(user?.passwordHash));

      if (!user || !user.passwordHash) {
        console.log("[Debug Login] Invalid user or no password hash");
        return res.status(401).json({ error: "Invalid email or password" });
      }

      console.log("[Debug Login] About to verify password...");
      const bcryptStart = Date.now();
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      const bcryptTime = Date.now() - bcryptStart;
      
      console.log("[Debug Login] Password verification completed in", bcryptTime, "ms");
      console.log("[Debug Login] Password valid:", isValidPassword);

      if (!isValidPassword) {
        console.log("[Debug Login] Invalid password");
        return res.status(401).json({ error: "Invalid email or password" });
      }

      console.log("[Debug Login] About to update last signed in...");
      const updateStart = Date.now();
      
      // Update last signed in
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });
      
      const updateTime = Date.now() - updateStart;
      console.log("[Debug Login] User update completed in", updateTime, "ms");

      console.log("[Debug Login] About to create session token...");
      const sessionStart = Date.now();
      
      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId!, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS,
      });
      
      const sessionTime = Date.now() - sessionStart;
      console.log("[Debug Login] Session token created in", sessionTime, "ms");

      console.log("[Debug Login] About to set cookie...");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log("[Debug Login] Login successful!");
      res.json({ 
        success: true, 
        user: { 
          email: user.email, 
          name: user.name || user.email,
          role: user.role 
        },
        debug: {
          dbTime,
          bcryptTime,
          updateTime,
          sessionTime,
          totalTime: Date.now() - startTime
        }
      });
    } catch (error) {
      console.error("[Debug Login] Login failed:", error);
      res.status(500).json({ error: "Login failed", details: (error as Error).message });
    }
  });
}