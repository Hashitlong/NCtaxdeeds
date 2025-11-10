import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { isEmailAllowed } from "../db";
import { ENV } from "./env";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
    
    if (user) {
      console.log(`[Context] User authenticated: ${user.email} (openId: ${user.openId})`);
    }
    
    // Access control: Check if user email is in whitelist
    if (user && user.email) {
      const isOwner = Boolean(ENV.ownerOpenId && user.openId === ENV.ownerOpenId);
      const isAdmin = user.role === "admin";
      const shouldCheckWhitelist = !isOwner && !isAdmin;

      if (shouldCheckWhitelist) {
        const allowed = await isEmailAllowed(user.email);
        if (!allowed) {
          console.log(`[Context] User ${user.email} not in whitelist, access denied`);
          // User is authenticated but not in whitelist
          if (!opts.req.path?.includes('/api/')) {
            opts.res.redirect('/access-denied');
          }
          user = null;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    console.log(`[Context] Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
