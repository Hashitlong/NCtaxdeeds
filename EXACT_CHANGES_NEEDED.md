# Exact Changes for Your Railway Service

Based on your screenshots, here's what to change:

## 1. Deploy Section (Screenshot 4)

Find the **"Custom Start Command"** section and click **"+ Start Command"**

Enter: `npm run scrape`

## 2. Restart Policy (Screenshot 1 & 2)

Change **"Restart Policy"** from **"On Failure"** to **"Never"**

Click the dropdown that says "On Failure" and select "Never"

## 3. Cron Schedule (Screenshot 2 & 3)

Click the **"+ Cron Schedule"** button

Enter: `0 0 * * *`

This will run daily at midnight.

## 4. Variables Tab

Click on the **"Variables"** tab (next to Settings at the top)

Then:
1. Click **"New Variable"**
2. Click **"Add Reference"**  
3. Select **"MySQL"** from the dropdown
4. This automatically adds DATABASE_URL

## Summary of Changes:

✅ **Start Command**: `npm run scrape`
✅ **Restart Policy**: Never
✅ **Cron Schedule**: `0 0 * * *`
✅ **Variable**: DATABASE_URL (reference MySQL)

After making these changes, click **"Deploy"** to test it!