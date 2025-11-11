# Simple Step-by-Step Setup Guide

## ✅ Good News: All Code is Already Deployed!

The scraper fixes are already in your GitHub and Railway. You just need to set up the automatic scheduling (5 minutes, one time only).

---

## Step-by-Step Instructions (With Pictures)

### Step 1: Open Railway Dashboard

1. Go to: **https://railway.app/**
2. Click **"Login"** (top right)
3. You should see your project: **"truthful-encouragement"**
4. Click on it to open

---

### Step 2: Create New Cron Service

1. Inside your project, look for a **"+ New"** button (usually top right or center)
2. Click **"+ New"**
3. You'll see options like:
   - Empty Service
   - Database
   - GitHub Repo
4. Click **"GitHub Repo"**

---

### Step 3: Connect Your Repository

1. You'll see a list of your GitHub repositories
2. Find and click: **"Hashitlong/NCtaxdeeds"** (your repo)
3. Railway will start setting it up
4. Wait for it to finish (about 30 seconds)

---

### Step 4: Name the Service

1. At the top, you'll see the service name (probably "NCtaxdeeds-1" or similar)
2. Click on the name to edit it
3. Change it to: **"Scraper-Cron"** (so you know what it does)
4. Press Enter to save

---

### Step 5: Configure the Service

1. Click on the **"Settings"** tab (left sidebar or top menu)
2. Scroll down to find **"Deploy"** section
3. Look for **"Custom Start Command"** or **"Start Command"**
4. In the text box, type: `npm run scrape`
5. Click **"Save"** or it saves automatically

---

### Step 6: Add Database Connection

1. Still in Settings, scroll to **"Variables"** or **"Environment Variables"**
2. Click **"+ New Variable"** or **"Add Variable"**
3. You have two options:

**Option A (Easier):**
- Click **"Add Reference"**
- Select your **MySQL database** service
- This automatically adds DATABASE_URL

**Option B (Manual):**
- Variable name: `DATABASE_URL`
- Value: Copy from your main "NCtaxdeeds" service variables
- Click **"Add"**

---

### Step 7: Set Restart Policy

1. Still in Settings, find **"Restart Policy"** or **"Deploy Settings"**
2. Change it to: **"Never"** or **"On Failure Only"**
3. This makes it run once and stop (perfect for cron jobs)

---

### Step 8: Set Up Schedule (Cron)

1. Look for **"Cron"** or **"Triggers"** tab
2. Click **"Add Cron Job"** or **"New Trigger"**
3. Enter a schedule (use one of these):

**Daily at midnight:**
```
0 0 * * *
```

**Daily at 6 AM:**
```
0 6 * * *
```

**Twice daily (midnight and noon):**
```
0 0,12 * * *
```

4. Click **"Save"** or **"Add"**

---

### Step 9: Test It (Optional)

1. Go back to the main service view
2. Click **"Deploy"** button
3. Watch the logs - you should see:
   - "Running Scrapers on Production"
   - "Starting all scrapers..."
   - Properties being scraped
   - "SCRAPING COMPLETE"
4. This confirms it works!

---

### Step 10: Verify on Website

1. Go to: **https://nctaxdeeds-production.up.railway.app/**
2. Log in with your email
3. Click on **"Properties"** page
4. You should see properties appearing!

---

## That's It! 🎉

Your scrapers will now run automatically on the schedule you set. No more manual work needed!

---

## Quick Reference

**What you just set up:**
- ✅ Automatic scraper that runs on schedule
- ✅ Pulls ~550+ properties from all sources
- ✅ Updates your production database
- ✅ Runs without any action from you

**If you need to run it manually:**
1. Go to Railway dashboard
2. Click "Scraper-Cron" service
3. Click "Deploy" button

**To change the schedule:**
1. Go to Railway dashboard
2. Click "Scraper-Cron" service
3. Go to "Cron" or "Triggers" tab
4. Edit the schedule

---

## Troubleshooting

**If you don't see the "+ New" button:**
- Look for "New Service" or "Add Service"
- It might be in a dropdown menu

**If you can't find "Cron" tab:**
- Railway might call it "Triggers" or "Schedules"
- Or you can use Railway's CLI: `railway cron add "0 0 * * *"`

**If scrapers don't run:**
- Check the service logs in Railway
- Make sure DATABASE_URL variable is set
- Verify the start command is `npm run scrape`

**Need help?**
- Railway docs: https://docs.railway.app/
- Or let me know what step you're stuck on!

---

## Summary

**Time needed:** 5 minutes (one time)
**Maintenance needed:** Zero
**Cost:** Minimal (~$0.50/month for daily runs)
**Result:** Always fresh property data, automatically!