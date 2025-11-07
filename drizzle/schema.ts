import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (openId) or email for local auth. Unique per user. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Hashed password for local authentication */
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User preferences table - stores user's preferred settings
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Properties page preferences
  defaultCountyFilter: varchar("defaultCountyFilter", { length: 50 }),
  defaultStatusFilter: varchar("defaultStatusFilter", { length: 50 }),
  defaultSourceFilter: varchar("defaultSourceFilter", { length: 50 }),
  defaultMinBid: varchar("defaultMinBid", { length: 20 }),
  defaultMaxBid: varchar("defaultMaxBid", { length: 20 }),
  defaultStartDate: varchar("defaultStartDate", { length: 20 }),
  defaultEndDate: varchar("defaultEndDate", { length: 20 }),
  defaultSortColumn: varchar("defaultSortColumn", { length: 50 }),
  defaultSortDirection: mysqlEnum("defaultSortDirection", ["asc", "desc"]),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

/**
 * Allowed users whitelist - controls who can access the application
 */
export const allowedUsers = mysqlTable("allowedUsers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  addedBy: varchar("addedBy", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AllowedUser = typeof allowedUsers.$inferSelect;
export type InsertAllowedUser = typeof allowedUsers.$inferInsert;

/**
 * Properties table - stores all scraped tax deed property listings
 */
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  
  // Location Information
  county: varchar("county", { length: 50 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  zipCode: varchar("zipCode", { length: 10 }),
  parcelId: varchar("parcelId", { length: 100 }).notNull(),
  
  // Sale Information
  saleDate: timestamp("saleDate"),
  saleTime: varchar("saleTime", { length: 20 }),
  saleStatus: mysqlEnum("saleStatus", ["scheduled", "in_upset_period", "sold", "cancelled", "pending", "postponed"]).default("scheduled"),
  saleLocation: text("saleLocation"),
  
  // Bidding Information
  openingBid: bigint("openingBid", { mode: 'number' }), // stored in cents to avoid decimal issues
  currentBid: bigint("currentBid", { mode: 'number' }), // stored in cents
  upsetBidCloseDate: timestamp("upsetBidCloseDate"),
  upsetBidCount: int("upsetBidCount").default(0),
  
  // Property Details
  propertyType: varchar("propertyType", { length: 100 }),
  propertyDescription: text("propertyDescription"),
  acreage: varchar("acreage", { length: 50 }), // store as string to preserve precision
  squareFootage: int("squareFootage"),
  legalDescription: text("legalDescription"),
  
  // Tax and Financial Information
  taxAmountOwed: int("taxAmountOwed"), // stored in cents
  assessedValue: int("assessedValue"), // stored in cents
  
  // Case Information
  courtFileNumber: varchar("courtFileNumber", { length: 100 }),
  caseNumber: varchar("caseNumber", { length: 100 }),
  attorneyFirm: varchar("attorneyFirm", { length: 200 }),
  attorneyFileNumber: varchar("attorneyFileNumber", { length: 100 }),
  owner: text("owner"), // property owner name from case title
  deedBookPage: varchar("deedBookPage", { length: 200 }), // book and page references
  depositRequired: varchar("depositRequired", { length: 100 }), // deposit amount or percentage
  noticeText: text("noticeText"), // full foreclosure notice text
  
  // Metadata
  sourceUrl: text("sourceUrl"),
  sourceType: varchar("sourceType", { length: 50 }), // 'kania', 'zls', 'county_website', 'pdf'
  firstScrapedAt: timestamp("firstScrapedAt").defaultNow().notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow().notNull(),
  isActive: int("isActive").default(1).notNull(),
  
  // Geocoding for map visualization
  latitude: varchar("latitude", { length: 20 }), // stored as string to preserve precision
  longitude: varchar("longitude", { length: 20 }),
  geocodedAt: timestamp("geocodedAt"), // when geocoding was performed
  
  // Team collaboration
  checkedOutBy: int("checkedOutBy"), // user ID who checked out this property
  checkedOutAt: timestamp("checkedOutAt"), // when property was checked out
  arv: int("arv"), // After Repair Value in cents
  arvAddedBy: int("arvAddedBy"), // user ID who added ARV
  arvAddedAt: timestamp("arvAddedAt"), // when ARV was added
  
  // Team rating - good/bad/watching
  teamRating: mysqlEnum("teamRating", ["good", "bad", "watching"]), // team's assessment of property
  ratedBy: int("ratedBy"), // user ID who rated this property
  ratedAt: timestamp("ratedAt"), // when rating was added
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

/**
 * Counties table - reference data for all NC counties
 */
export const counties = mysqlTable("counties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  fipsCode: varchar("fipsCode", { length: 5 }),
  population: int("population"),
  websiteUrl: text("websiteUrl"),
  taxOfficeUrl: text("taxOfficeUrl"),
  foreclosureUrl: text("foreclosureUrl"),
  primarySource: varchar("primarySource", { length: 100 }), // 'kania', 'zls', 'county_direct', etc.
  scraperEnabled: int("scraperEnabled").default(1).notNull(),
  lastSuccessfulScrape: timestamp("lastSuccessfulScrape"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type County = typeof counties.$inferSelect;
export type InsertCounty = typeof counties.$inferInsert;

/**
 * Scrape history table - tracks all scraping operations
 */
export const scrapeHistory = mysqlTable("scrapeHistory", {
  id: int("id").autoincrement().primaryKey(),
  sourceName: varchar("sourceName", { length: 100 }).notNull(),
  sourceType: varchar("sourceType", { length: 50 }).notNull(),
  scrapeStartedAt: timestamp("scrapeStartedAt").notNull(),
  scrapeCompletedAt: timestamp("scrapeCompletedAt"),
  status: mysqlEnum("status", ["success", "failed", "partial"]),
  propertiesFound: int("propertiesFound"),
  propertiesNew: int("propertiesNew"),
  propertiesUpdated: int("propertiesUpdated"),
  errorMessage: text("errorMessage"),
  metadata: text("metadata"), // JSON string for additional info
});

export type ScrapeHistory = typeof scrapeHistory.$inferSelect;
export type InsertScrapeHistory = typeof scrapeHistory.$inferInsert;

/**
 * Property history table - tracks changes to properties over time
 */
export const propertyHistory = mysqlTable("propertyHistory", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
  fieldName: varchar("fieldName", { length: 50 }),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  changeType: varchar("changeType", { length: 50 }), // 'bid_update', 'status_change', 'date_change', etc.
});

export type PropertyHistory = typeof propertyHistory.$inferSelect;
export type InsertPropertyHistory = typeof propertyHistory.$inferInsert;

/**
 * Saved searches table - stores user's saved filter combinations
 */
export const savedSearches = mysqlTable("savedSearches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  filters: text("filters").notNull(), // JSON string of filter values
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Favorites table - stores user's favorited properties
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Property notes table - stores team notes on properties
 */
export const propertyNotes = mysqlTable("propertyNotes", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  userId: int("userId").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyNote = typeof propertyNotes.$inferSelect;
export type InsertPropertyNote = typeof propertyNotes.$inferInsert;

/**
 * Notification preferences table - stores user notification settings
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  counties: text("counties"), // JSON array of county names
  minBid: int("minBid"),
  maxBid: int("maxBid"),
  emailEnabled: int("emailEnabled").default(1).notNull(), // 1 = true, 0 = false
  inAppEnabled: int("inAppEnabled").default(1).notNull(),
  frequency: varchar("frequency", { length: 20 }).default("immediate").notNull(), // immediate, daily
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Notification history table - tracks sent notifications
 */
export const notificationHistory = mysqlTable("notificationHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyId: int("propertyId").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // email, in_app
  status: varchar("status", { length: 20 }).notNull(), // sent, failed, read
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});

export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type InsertNotificationHistory = typeof notificationHistory.$inferInsert;
