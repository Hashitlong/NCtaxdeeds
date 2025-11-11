# Running Scrapers on Production (Railway)

## Problem
The scrapers ran successfully on your **local** database, but the **production** site on Railway (https://nctaxdeeds-production.up.railway.app/) has a separate database that needs to be populated.

## Solution: Run Scrapers on Railway

### Option 1: Run Scrapers via Railway CLI (Recommended)

You already have a Railway shell open in Terminal 2. Use it to run the scrapers:

```bash
# In Terminal 2 (railway shell)
tsx run_all_scrapers.ts
```

Or run individual scrapers:
```bash
tsx scrapers/hutchens_scraper.ts
tsx scrapers/kania_scraper.ts
tsx scrapers/zls_scraper.ts
```

### Option 2: Set Up Automated Scraping on Railway

Create a scheduled job on Railway to run scrapers automatically:

1. **Add a cron job script** (`scripts/cron-scraper.ts`):
```typescript
import 'dotenv/config';
import { ScraperService } from '../server/scraperService';

async function main() {
  console.log('[Cron] Starting scheduled scrape...');
  const service = new ScraperService();
  const result = await service.runScraper('all');
  console.log('[Cron] Scrape complete:', result);
}

main().catch(console.error);
```

2. **Add to package.json**:
```json
{
  "scripts": {
    "scrape": "tsx scripts/cron-scraper.ts"
  }
}
```

3. **Set up Railway Cron**:
   - Go to Railway dashboard
   - Add a new service
   - Set it to run `npm run scrape` on a schedule (e.g., daily)

### Option 3: Run Scrapers Locally Against Production DB

Get the production DATABASE_URL from Railway and run scrapers locally:

```bash
# Get the DATABASE_URL from Railway
railway variables

# Run scrapers with production DATABASE_URL
DATABASE_URL="<production-db-url>" tsx run_all_scrapers.ts
```

### Option 4: Add Admin Scraper Trigger

Add a button in the admin panel to trigger scrapers manually:

1. **Add to admin page** (`client/src/pages/Admin.tsx`)
2. **Add tRPC endpoint** to trigger scrapers
3. **Click button** to run scrapers on demand

## Verify Production Data

After running scrapers on production, check the data:

```bash
# In railway shell
railway run mysql -e "SELECT COUNT(*) FROM properties;"
```

Or log into the production site and check the Properties page.

## Current Status

✅ **Local scrapers**: Working perfectly (408 properties in local DB)
❌ **Production scrapers**: Need to be run on Railway database

## Next Steps

1. Use Terminal 2 (railway shell) to run: `tsx run_all_scrapers.ts`
2. Wait for scrapers to complete (may take 2-3 minutes)
3. Refresh https://nctaxdeeds-production.up.railway.app/ and log in
4. You should see all the scraped properties

## Important Notes

- The fixes we made (Hutchens validation, health checks, logging) are already in your code
- When you deploy to Railway, these fixes will be included
- The scrapers will work the same way on production as they do locally
- Make sure Railway has the correct DATABASE_URL environment variable set