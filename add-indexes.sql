-- Performance Optimization: Add indexes to frequently queried columns
-- Run this script to improve query performance across the application

-- Properties table indexes
CREATE INDEX IF NOT EXISTS idx_properties_county ON properties(county);
CREATE INDEX IF NOT EXISTS idx_properties_saleStatus ON properties(saleStatus);
CREATE INDEX IF NOT EXISTS idx_properties_saleDate ON properties(saleDate);
CREATE INDEX IF NOT EXISTS idx_properties_createdAt ON properties(createdAt);
CREATE INDEX IF NOT EXISTS idx_properties_isActive ON properties(isActive);
CREATE INDEX IF NOT EXISTS idx_properties_upsetBidDeadline ON properties(upsetBidDeadline);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_county_status ON properties(county, saleStatus);
CREATE INDEX IF NOT EXISTS idx_properties_status_date ON properties(saleStatus, saleDate);
CREATE INDEX IF NOT EXISTS idx_properties_active_county ON properties(isActive, county);

-- SavedSearches table indexes
CREATE INDEX IF NOT EXISTS idx_savedSearches_userId ON savedSearches(userId);
CREATE INDEX IF NOT EXISTS idx_savedSearches_createdAt ON savedSearches(createdAt);

-- Favorites table indexes
CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId);
CREATE INDEX IF NOT EXISTS idx_favorites_propertyId ON favorites(propertyId);
CREATE INDEX IF NOT EXISTS idx_favorites_userId_propertyId ON favorites(userId, propertyId);

-- PropertyHistory table indexes
CREATE INDEX IF NOT EXISTS idx_propertyHistory_propertyId ON propertyHistory(propertyId);
CREATE INDEX IF NOT EXISTS idx_propertyHistory_changedAt ON propertyHistory(changedAt);

-- Users table indexes (if needed for future queries)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_lastSignedIn ON users(lastSignedIn);

-- Scraper history indexes
CREATE INDEX IF NOT EXISTS idx_scrapeHistory_scraperName ON scrapeHistory(scraperName);
CREATE INDEX IF NOT EXISTS idx_scrapeHistory_startedAt ON scrapeHistory(startedAt);
CREATE INDEX IF NOT EXISTS idx_scrapeHistory_status ON scrapeHistory(status);
