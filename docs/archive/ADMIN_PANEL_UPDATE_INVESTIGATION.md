# Investigation: Admin Panel Not Updating After Automated Scrapes

**Date:** November 6, 2025  
**Issue:** Automated scrapes update property cards but Admin Panel scraper status doesn't refresh

---

## Summary

**Root Cause: The Admin Panel is NOT automatically refreshing after automated scrapes complete.**

The automated scraping system is working correctly - it saves scrape history to the database. However, the Admin Panel UI doesn't know when new scrapes complete, so it continues showing stale data until the user manually refreshes the page.

---

## How It Works Now

### 1. Automated Scraping (Working Correctly ✅)

**Endpoint:** `POST /api/internal/cron/scrape`  
**File:** `server/_core/index.ts` (lines 40-68)

```typescript
app.post("/api/internal/cron/scrape", async (req, res) => {
  const { ScraperService } = await import('../scraperService');
  const service = new ScraperService();
  const result = await service.runScraper('all');
  // Returns success/count/error
});
```

**What happens:**
1. Cron job hits `/api/internal/cron/scrape` endpoint (scheduled for 2 AM daily)
2. `ScraperService.runScraper()` executes all scrapers
3. Scrapes properties and saves to `properties` table
4. **Saves scrape history to `scrapeHistory` table** ✅
5. Returns success response

**File:** `server/scraperService.ts` (lines 174-178)

```typescript
// Save history
const db = await getDb();
if (db) {
  await db.insert(scrapeHistory).values(historyRecord);
}
```

### 2. Admin Panel Display (Shows Stale Data ❌)

**Component:** `client/src/pages/Admin.tsx`  
**Query:** `trpc.scraper.history.useQuery(20)`

**What happens:**
1. Admin Panel loads and fetches last 20 scrape history records
2. Displays them in the table
3. **Does NOT automatically refetch when new scrapes complete** ❌
4. User sees old data until they manually refresh the page or click a button

**File:** `client/src/pages/Admin.tsx` (line 22)

```typescript
const { data: scrapeHistory, isLoading, refetch } = trpc.scraper.history.useQuery(20);
```

### 3. Property Cards (Update Correctly ✅)

**Why property cards show updated data:**
- Property cards query the `properties` table directly
- When you open a property detail popup, it fetches fresh data from the database
- The automated scraper updates the `properties` table, so cards show current data

---

## The Problem

**The Admin Panel uses a static query that doesn't automatically refetch.**

tRPC's `useQuery` hook fetches data once when the component mounts, then caches it. It doesn't know when new scrapes complete in the background, so it continues showing the cached data.

**Comparison:**

| Component | Data Source | Auto-Refresh? | Why? |
|-----------|-------------|---------------|------|
| Property Cards | `properties` table | ✅ Yes | Fetches fresh data on each open |
| Admin Panel | `scrapeHistory` table | ❌ No | Static query, no refetch trigger |

---

## Solutions

### Option 1: Add Polling (Simplest) ⭐ **RECOMMENDED**

Make the Admin Panel automatically refetch scraper history every 30-60 seconds.

**Implementation:**
```typescript
// In Admin.tsx
const { data: scrapeHistory, isLoading, refetch } = trpc.scraper.history.useQuery(20, {
  refetchInterval: 60000, // Refetch every 60 seconds
});
```

**Pros:**
- Simple 1-line change
- Works immediately
- No backend changes needed

**Cons:**
- Polls even when no scrapes are running
- Slight network overhead

---

### Option 2: Manual Refresh Button (Current Workaround)

Add a "Refresh" button to the Admin Panel that calls `refetch()`.

**Implementation:**
```typescript
<Button onClick={() => refetch()}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Refresh History
</Button>
```

**Pros:**
- No automatic polling
- User controls when to refresh

**Cons:**
- User must remember to click refresh
- Not automatic

---

### Option 3: WebSocket/Server-Sent Events (Most Complex)

Push notifications from server to client when scrapes complete.

**Implementation:**
- Add WebSocket server
- Emit event when scrape completes
- Client listens and calls `refetch()`

**Pros:**
- Real-time updates
- No polling overhead

**Cons:**
- Complex implementation
- Requires WebSocket infrastructure
- Overkill for this use case

---

## Recommendation

**Use Option 1 (Polling) with 60-second interval.**

This is the simplest solution and perfectly adequate for an internal admin panel. The Admin Panel will automatically show updated scraper status within 1 minute of completion.

**Why 60 seconds?**
- Scrapes take 15-20 minutes to complete
- No need for real-time updates (not mission-critical)
- Minimal network overhead
- Simple to implement

---

## Implementation Steps

1. Open `client/src/pages/Admin.tsx`
2. Find line 22: `const { data: scrapeHistory, isLoading, refetch } = trpc.scraper.history.useQuery(20);`
3. Change to:
   ```typescript
   const { data: scrapeHistory, isLoading, refetch } = trpc.scraper.history.useQuery(20, {
     refetchInterval: 60000, // Auto-refresh every 60 seconds
   });
   ```
4. Test by running a manual scrape and watching the Admin Panel update automatically

---

## Verification

**Before fix:**
- Run automated scrape at 2 AM
- Check Admin Panel at 2:30 AM
- Scraper history shows old data ❌
- Refresh page manually
- Now shows new data ✅

**After fix:**
- Run automated scrape at 2 AM
- Check Admin Panel at 2:30 AM
- Scraper history automatically shows new data within 60 seconds ✅

---

## Additional Notes

**Why property cards work but Admin Panel doesn't:**

The property cards fetch data from the `properties` table, which is updated by the scraper. When you open a property detail popup, it makes a fresh query to the database, so you always see current data.

The Admin Panel fetches data from the `scrapeHistory` table, which is also updated by the scraper. However, the Admin Panel component doesn't refetch this data automatically - it only fetches once when the page loads.

**Both tables are being updated correctly by the automated scraper.** The issue is purely a frontend caching/refresh problem.
