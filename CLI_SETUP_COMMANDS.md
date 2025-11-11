# Simple CLI Commands to Set Up Scrapers

## The Easiest Solution

Railway CLI can't create cron services, but here's the simplest approach:

### Option 1: One-Time Manual Run (Simplest)

Just run this command once to populate your production database:

```bash
# This will take 2-3 minutes
railway run --service NCtaxdeeds npm run scrape
```

**Problem:** This tries to connect from your local machine to Railway's internal database, which doesn't work.

### Option 2: Use Railway Dashboard (5 Minutes, Recommended)

Unfortunately, Railway CLI doesn't support creating cron services. You need to use the dashboard:

1. Go to https://railway.app/
2. Click your project
3. Click "+ New" → "GitHub Repo" → Select your repo
4. Settings → Start Command: `npm run scrape`
5. Variables → Add DATABASE_URL (reference MySQL service)
6. Done!

See [`SIMPLE_SETUP_GUIDE.md`](SIMPLE_SETUP_GUIDE.md:1) for detailed steps with pictures.

### Option 3: I Can Add an Admin Button

I can add a "Run Scrapers" button to your admin panel that you click once to populate the database, then use whenever you want fresh data.

Would you like me to implement the admin button? It's the most user-friendly solution.

## Summary

**Railway CLI limitations:**
- ❌ Can't create new services
- ❌ Can't set up cron jobs
- ❌ Can't run commands in Railway's network from local machine

**Your options:**
1. ✅ Use Railway dashboard (5 minutes, one time)
2. ✅ Let me add an admin button (code solution, very user-friendly)
3. ✅ Manually trigger via dashboard when needed

Which would you prefer?