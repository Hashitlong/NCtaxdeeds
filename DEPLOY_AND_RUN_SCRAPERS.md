# Deploy and Run Scrapers on Railway Production

## ✅ What's Been Done

1. **Fixed all scraper issues**:
   - ✅ Hutchens scraper data validation
   - ✅ Database health checks
   - ✅ Improved error logging
   - ✅ All fixes committed and pushed to GitHub

2. **Created production scraper script**:
   - ✅ `scripts/run-scrapers-production.ts`
   - ✅ Added `npm run scrape` command
   - ✅ Pushed to GitHub

## 🚀 Next Steps to Populate Production

Railway should automatically deploy the latest code from GitHub. Once deployed, you have **3 options** to run the scrapers:

### Option 1: Run via Railway Dashboard (Easiest)

1. Go to Railway dashboard: https://railway.app/
2. Select your project: "truthful-encouragement"
3. Select service: "NCtaxdeeds"
4. Click on "Deployments" tab
5. Wait for the latest deployment to complete (should be automatic)
6. Once deployed, go to the service settings
7. Add a **one-off command**: `npm run scrape`
8. Or use the Railway CLI (see Option 2)

### Option 2: Run via Railway CLI (Recommended)

Once Railway finishes deploying the latest code:

```bash
# Wait for deployment to complete (check Railway dashboard)
# Then run the scraper script on Railway:
railway run npm run scrape
```

This will:
- Connect to the production Railway database
- Run all scrapers (Hutchens, Kania, ZLS, etc.)
- Save ~400+ properties to production database
- Take about 2-3 minutes

### Option 3: SSH into Railway and Run Manually

```bash
# In Terminal 2 (already has railway shell open):
npm run scrape
```

## 📊 Verify Production Data

After running scrapers, verify the data:

### Via Railway CLI:
```bash
railway run --service mysql "SELECT COUNT(*) FROM properties;"
```

### Via Website:
1. Go to https://nctaxdeeds-production.up.railway.app/
2. Log in with your credentials
3. Navigate to Properties page
4. You should see all scraped properties

## 🔄 Set Up Automated Scraping (Optional)

To keep data fresh, set up a cron job on Railway:

1. **Create a new Railway service** for the cron job
2. **Set the start command** to: `npm run scrape`
3. **Add a cron schedule**: 
   - Daily: `0 0 * * *` (midnight)
   - Weekly: `0 0 * * 0` (Sunday midnight)
   - Custom: Use cron syntax

Or use Railway's built-in cron feature if available.

## 📝 Summary

**Current Status:**
- ✅ All scraper fixes committed to GitHub
- ✅ Production script created (`npm run scrape`)
- ✅ Code pushed and deploying to Railway
- ⏳ Waiting for Railway deployment to complete
- ⏳ Need to run `railway run npm run scrape` after deployment

**Expected Result:**
- ~196 properties from Hutchens
- ~212 properties from Kania  
- ~150 properties from ZLS
- **Total: ~550+ properties** in production database

## 🐛 Troubleshooting

If `railway run npm run scrape` fails:

1. **Check Railway deployment status**:
   ```bash
   railway status
   railway logs
   ```

2. **Verify DATABASE_URL is set**:
   ```bash
   railway variables
   ```

3. **Check if service is running**:
   ```bash
   railway ps
   ```

4. **Try running in Railway shell**:
   ```bash
   railway shell
   npm run scrape
   ```

## 📞 Need Help?

If you encounter issues:
1. Check Railway logs for errors
2. Verify the deployment completed successfully
3. Ensure DATABASE_URL environment variable is set in Railway
4. Try running the scraper script locally first to verify it works

---

**Ready to populate production?** 

Wait for Railway to finish deploying, then run:
```bash
railway run npm run scrape