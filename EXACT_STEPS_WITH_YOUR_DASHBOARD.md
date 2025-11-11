# Exact Steps for Your Railway Dashboard

Looking at your screenshot, here's exactly what to do:

## Step 1: Add New Service

1. Look at the **left side** of your screen where you see:
   - MySQL (database icon)
   - NCtaxdeeds (GitHub icon)

2. Click the **"+ New"** button (should be near the top or in that left panel)

## Step 2: Select Your Repo

1. When the menu appears, click **"GitHub Repo"**
2. You'll see your repo: **"Hashitlong/NCtaxdeeds"**
3. Click on it again (yes, the same repo - Railway allows multiple services from one repo)

## Step 3: Configure the New Service

After it creates the service:

1. **Click on the new service** (it will appear in the left panel)
2. Click **"Settings"** tab at the top
3. Find **"Service Name"** and change it to: `Scraper-Cron`
4. Scroll down to **"Deploy"** section
5. Find **"Start Command"** field
6. Type: `npm run scrape`
7. Save (it auto-saves)

## Step 4: Add Database Connection

1. Still in Settings, scroll to **"Variables"** section
2. Click **"New Variable"**
3. Click **"Add Reference"**
4. Select **"MySQL"** (your database service)
5. This automatically adds DATABASE_URL

## Step 5: Set Restart Policy

1. In Settings, find **"Restart Policy"**
2. Change to: **"Never"** or **"On Failure"**
3. This makes it run once and stop (perfect for cron)

## Step 6: Add Cron Schedule

1. Look for **"Cron"** tab at the top (next to Settings, Variables, etc.)
2. If you don't see it, look for **"Triggers"**
3. Click **"Add Cron"** or **"New Trigger"**
4. Enter: `0 0 * * *` (runs daily at midnight)
5. Save

## Step 7: Test It

1. Go back to the service main view
2. Click **"Deploy"** button
3. Watch the logs - you should see scrapers running
4. Wait 2-3 minutes for completion

## That's It!

Your scrapers will now run automatically every day at midnight.

## Visual Guide

Your dashboard should look like this after setup:

```
Left Panel:
├── MySQL (database)
├── NCtaxdeeds (main app)
└── Scraper-Cron (new - runs scrapers) ← You're adding this
```

## If You Get Stuck

Take a screenshot of where you're stuck and I can give you the exact next step!