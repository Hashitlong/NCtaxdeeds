import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { isEmailAllowed } from "../db";

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
    
    // Access control: Check if user email is in whitelist
    if (user && user.email) {
      const allowed = await isEmailAllowed(user.email);
      if (!allowed) {
        // User is authenticated but not in whitelist
        // Redirect to access denied page
        if (!opts.req.path?.includes('/api/')) {
          opts.res.redirect('/access-denied');
        }
        user = null;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
