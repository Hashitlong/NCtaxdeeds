# Automated Scraper Setup - Long-term Solution

## Overview
This setup will automatically run your scrapers daily on Railway without any manual intervention.

## What's Been Created

1. ✅ **Fixed Scrapers** - All bugs fixed and tested
2. ✅ **Production Script** - `npm run scrape` command
3. ✅ **Railway Cron Config** - `railway-cron.json`

## Setup Instructions (One-Time, 5 Minutes)

### Step 1: Create Cron Service on Railway

1. Go to https://railway.app/
2. Open your project: "truthful-encouragement"
3. Click **"+ New"** button
4. Select **"GitHub Repo"**
5. Choose your repository: `Hashitlong/NCtaxdeeds`
6. Name it: **"Scraper Cron"**

### Step 2: Configure the Cron Service

1. Click on the new "Scraper Cron" service
2. Go to **"Settings"** tab
3. Under **"Deploy"** section:
   - **Start Command**: `npm run scrape`
   - **Restart Policy**: Select "Never" (runs once and exits)

### Step 3: Add Environment Variables

The cron service needs access to the same database:

1. In the "Scraper Cron" service settings
2. Go to **"Variables"** tab
3. Click **"Reference"** → Select your MySQL service
4. This will automatically add `DATABASE_URL`

Or manually add:
- `DATABASE_URL`: (copy from main service)
- `NODE_ENV`: `production`

### Step 4: Set Up Schedule

1. In "Scraper Cron" service settings
2. Go to **"Triggers"** or **"Cron"** tab
3. Add a cron schedule:
   - **Daily at midnight**: `0 0 * * *`
   - **Daily at 6 AM**: `0 6 * * *`
   - **Twice daily**: `0 0,12 * * *`
   - **Weekly (Sunday)**: `0 0 * * 0`

### Step 5: Test It

1. Click **"Deploy"** on the Scraper Cron service
2. Watch the logs to see scrapers run
3. Check your production site for new properties

## How It Works

```
┌─────────────────┐
│  Railway Cron   │  Triggers on schedule
│    Service      │  (e.g., daily at midnight)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm run scrape │  Runs scraper script
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  All Scrapers   │  Hutchens, Kania, ZLS, etc.
│   Run in Order  │  ~550+ properties
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Production DB   │  Properties saved
│   on Railway    │  Available on website
└─────────────────┘
```

## Benefits

✅ **Fully Automated** - Runs on schedule without manual intervention
✅ **Always Fresh Data** - Properties updated daily (or your chosen schedule)
✅ **No Maintenance** - Set it and forget it
✅ **Reliable** - Railway handles execution and retries
✅ **Logged** - View scraper logs in Railway dashboard
✅ **Scalable** - Easy to adjust schedule or add more scrapers

## Monitoring

### View Scraper Logs:
1. Go to Railway dashboard
2. Click "Scraper Cron" service
3. View "Deployments" tab
4. Click on any deployment to see logs

### Check Results:
1. Go to https://nctaxdeeds-production.up.railway.app/
2. Log in
3. View Properties page
4. Check "Last Updated" timestamps

## Troubleshooting

### If scrapers don't run:
1. Check Railway cron service logs
2. Verify DATABASE_URL is set
3. Ensure cron schedule is active
4. Check for deployment errors

### If no new properties appear:
1. Check scraper logs for errors
2. Verify source websites are accessible
3. Check database connection in logs

## Alternative: Manual Trigger

If you ever need to run scrapers manually:

1. Go to Railway dashboard
2. Click "Scraper Cron" service
3. Click "Deploy" button
4. Scrapers will run immediately

## Cost

Railway cron services are very cost-effective:
- Only charged for execution time (~2-3 minutes per run)
- Daily runs = ~90 minutes/month
- Minimal cost compared to main service

## Summary

**One-time setup** (5 minutes) gives you:
- ✅ Automated daily scraping
- ✅ Always fresh property data
- ✅ No manual intervention needed
- ✅ Professional, reliable solution

**Next Step**: Follow the setup instructions above to create the cron service on Railway.