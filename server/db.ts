import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import {
  InsertUser, users,
  properties, InsertProperty,
  counties, InsertCounty,
  scrapeHistory, InsertScrapeHistory,
  propertyHistory, InsertPropertyHistory,
  userPreferences, InsertUserPreferences, UserPreferences,
  allowedUsers, AllowedUser, InsertAllowedUser
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Creating connection pool...");
      const connection = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(connection);
      console.log("[Database] Connection pool created successfully");
      
      // Test the connection
      try {
        await _db.execute(sql`SELECT 1`);
        console.log("[Database] Connection test successful");
      } catch (testError) {
        console.warn("[Database] Connection test failed:", testError);
        // Don't fail startup, just log the warning
      }
    } catch (error) {
      console.warn("[Database] Failed to create connection pool:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Property queries
export async function getProperties(filters?: {
  county?: string;
  saleStatus?: string;
  propertyType?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(properties.isActive, 1)];
  
  if (filters?.county) {
    conditions.push(eq(properties.county, filters.county));
  }
  if (filters?.saleStatus) {
    conditions.push(eq(properties.saleStatus, filters.saleStatus as any));
  }
  if (filters?.propertyType) {
    conditions.push(eq(properties.propertyType, filters.propertyType));
  }

  let query = db.select().from(properties);
  
  if (conditions.length > 0) {
    query = query.where(conditions[0]) as any;
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertProperty(property: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(properties).values(property);
  return result;
}

export async function updateProperty(id: number, updates: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(properties).set(updates).where(eq(properties.id, id));
}

export async function updatePropertyNotice(propertyId: number, noticeDetails: {
  owner: string | null;
  caseNumber: string | null;
  legalDescription: string | null;
  deedBookPage: string | null;
  depositRequired: string | null;
  noticeText: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(properties).set({
    owner: noticeDetails.owner,
    caseNumber: noticeDetails.caseNumber,
    legalDescription: noticeDetails.legalDescription,
    deedBookPage: noticeDetails.deedBookPage,
    depositRequired: noticeDetails.depositRequired,
    noticeText: noticeDetails.noticeText,
  }).where(eq(properties.id, propertyId));
}

// County queries
export async function getAllCounties() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(counties).orderBy(counties.name);
}

export async function getCountyByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(counties).where(eq(counties.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function insertCounty(county: InsertCounty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(counties).values(county);
  return result;
}

export async function updateCounty(id: number, updates: Partial<InsertCounty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(counties).set(updates).where(eq(counties.id, id));
}

// Scrape history queries
export async function insertScrapeHistory(history: InsertScrapeHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(scrapeHistory).values(history);
  return result;
}

export async function getRecentScrapeHistory(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(scrapeHistory).orderBy(desc(scrapeHistory.scrapeStartedAt)).limit(limit);
}

// Property history queries
export async function insertPropertyHistory(history: InsertPropertyHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(propertyHistory).values(history);
  return result;
}

export async function getPropertyHistory(propertyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(propertyHistory).where(eq(propertyHistory.propertyId, propertyId)).orderBy(desc(propertyHistory.changedAt));
}


// User Preferences functions
export async function getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user preferences: database not available");
    return undefined;
  }

  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserPreferences(prefs: InsertUserPreferences): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user preferences: database not available");
    return;
  }

  try {
    await db.insert(userPreferences).values(prefs).onDuplicateKeyUpdate({
      set: {
        defaultCountyFilter: prefs.defaultCountyFilter,
        defaultStatusFilter: prefs.defaultStatusFilter,
        defaultMinBid: prefs.defaultMinBid,
        defaultMaxBid: prefs.defaultMaxBid,
        defaultStartDate: prefs.defaultStartDate,
        defaultEndDate: prefs.defaultEndDate,
        defaultSortColumn: prefs.defaultSortColumn,
        defaultSortDirection: prefs.defaultSortDirection,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user preferences:", error);
    throw error;
  }
}


// ===== Allowed Users Functions =====

export async function isEmailAllowed(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  try {
    const result = await db.select().from(allowedUsers).where(eq(allowedUsers.email, email.toLowerCase())).limit(1);
    return result.length > 0;
  } catch (error) {
    console.error("[Database] Failed to check allowed email:", error);
    return false;
  }
}

export async function getAllowedUsers(): Promise<AllowedUser[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(allowedUsers).orderBy(desc(allowedUsers.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get allowed users:", error);
    return [];
  }
}

export async function addAllowedUser(user: InsertAllowedUser): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(allowedUsers).values({
      ...user,
      email: user.email.toLowerCase()
    });
  } catch (error) {
    console.error("[Database] Failed to add allowed user:", error);
    throw error;
  }
}

export async function removeAllowedUser(email: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.delete(allowedUsers).where(eq(allowedUsers.email, email.toLowerCase()));
  } catch (error) {
    console.error("[Database] Failed to remove allowed user:", error);
    throw error;
  }
}
