# Post-Deployment Checklist

**Author:** Manus AI  
**Last Updated:** November 2, 2025

Use this checklist after deploying the NC Tax Deed Property Tracker to ensure everything is configured correctly and working as expected. Complete each section in order for a smooth launch.

---

## Phase 1: Verify Deployment Success

### Application Accessibility

**Task:** Confirm the application is accessible via its public URL

**Steps:**
1. Open your Railway dashboard
2. Navigate to your application service
3. Find the public URL under "Settings" → "Domains"
4. Click the URL to open the application in a new browser tab
5. Verify the homepage loads without errors

**Expected Result:** Homepage displays with navigation buttons visible (Browse Properties, Map View, Statistics, Admin Panel, etc.)

**If it fails:** Check deployment logs in Railway for error messages. Common issues include missing environment variables or build failures.

### Database Connection

**Task:** Verify the application can connect to the database

**Steps:**
1. Navigate to the Properties page (`/properties`)
2. Wait for the page to load completely
3. Check if properties are displayed or if you see an appropriate empty state message

**Expected Result:** Either properties load successfully, or you see a message like "No properties found" (which is normal for a fresh deployment)

**If it fails:** Verify `DATABASE_URL` is set correctly in environment variables. Check that the MySQL service is running in Railway.

### Database Schema

**Task:** Ensure all required database tables exist

**Steps:**
1. Access Railway's MySQL service in your project dashboard
2. Click "Data" tab to view tables
3. Verify the following tables exist:
   - `users`
   - `properties`
   - `propertyHistory`
   - `savedSearches`
   - `favorites`
   - `notificationPreferences`
   - `notificationHistory`

**Expected Result:** All seven tables are present

**If tables are missing:** Run database migrations using Railway CLI: `railway run pnpm db:push`

---

## Phase 2: Configure Application Settings

### Admin Account Setup

**Task:** Create your admin account

**Steps:**
1. If OAuth is configured: Click the login button and sign in with the account matching `OWNER_OPEN_ID`
2. If OAuth is not configured: The application runs in open-access mode (skip this step)
3. Navigate to the Admin Panel
4. Verify you can access scraper controls

**Expected Result:** Admin Panel is accessible and shows scraper management interface

**If you can't access Admin Panel:** Check that `OWNER_OPEN_ID` matches your actual OpenID from the OAuth provider. Alternatively, manually update the `users` table in the database to set your account's `role` to `admin`.

### Branding Customization

**Task:** Update application title and logo

**Steps:**
1. Access Railway environment variables
2. Update `VITE_APP_TITLE` to your preferred name (e.g., "Smith Real Estate - Tax Deeds")
3. Update `VITE_APP_LOGO` to your logo URL
4. Save changes (Railway will automatically redeploy)
5. Wait 2-3 minutes for redeployment
6. Refresh your browser to see changes

**Expected Result:** Application displays your custom title and logo

**Alternative:** If you prefer GUI configuration, use the website settings panel after deployment (if available in your version).

### Database Indexes

**Task:** Apply performance indexes to the database

**Steps:**
1. Locate the `add-indexes.sql` file in your repository
2. Access Railway's MySQL service → "Data" tab
3. Copy the SQL commands from `add-indexes.sql`
4. Paste into the SQL query box
5. Execute the queries

**Expected Result:** All indexes are created successfully. Queries will run 50-80% faster.

**Why this matters:** Without indexes, the application will slow down significantly as your property database grows beyond 1,000 records.

---

## Phase 3: Test Core Features

### Property Browsing

**Task:** Verify property listing and filtering work correctly

**Steps:**
1. Navigate to Properties page
2. Try each filter (county, status, bid range, date range, search)
3. Apply multiple filters simultaneously
4. Click "Clear All" to reset filters
5. Test sorting by clicking column headers

**Expected Result:** Filters work correctly and update the property list. Sorting changes the order of properties.

**If filtering doesn't work:** Check browser console for JavaScript errors. Verify the tRPC API endpoints are responding correctly.

### Map View

**Task:** Confirm map displays property markers

**Steps:**
1. Navigate to Map View page
2. Wait for the map to load
3. Look for property markers (pins) on the map
4. Click a marker to see property details
5. Try zooming and panning the map

**Expected Result:** Map loads with property markers. Clicking markers shows info windows with property details.

**If map doesn't load:** Verify `BUILT_IN_FORGE_API_KEY` and related map variables are set. Check browser console for API errors.

**If no markers appear:** Properties need geocoding. Navigate to Admin Panel and run the geocoding process, or check that properties have `latitude` and `longitude` values in the database.

### Statistics Dashboard

**Task:** Verify charts and statistics display correctly

**Steps:**
1. Navigate to Statistics page
2. Check that all charts render (bar chart, pie chart)
3. Verify overview cards show correct counts
4. Test the county comparison table
5. Navigate to Calendar view and check upcoming sales

**Expected Result:** All charts display data. Overview cards show property counts. Calendar shows upcoming sales.

**If charts don't render:** Check browser console for errors. Verify the statistics API endpoints are responding.

### Saved Searches & Favorites

**Task:** Test user feature functionality

**Steps:**
1. Go to Properties page
2. Apply some filters
3. Click "Save Search" and give it a name
4. Navigate to Saved Searches page and verify it appears
5. Click a property's star icon to favorite it
6. Navigate to Favorites page and verify it appears

**Expected Result:** Saved searches and favorites persist correctly. You can view and delete them from their respective pages.

**If features don't work:** Verify the `savedSearches` and `favorites` tables exist in the database. Check that you're logged in (if OAuth is enabled).

### Export Functionality

**Task:** Verify CSV export works

**Steps:**
1. Go to Properties page
2. Apply some filters to narrow down results
3. Click "Export CSV"
4. Check that a file downloads
5. Open the CSV file and verify it contains property data

**Expected Result:** CSV file downloads with all property fields included. Filename includes current date.

**If export fails:** Check browser console for errors. Verify the export function has access to property data.

---

## Phase 4: Configure Scrapers

### Review Available Scrapers

**Task:** Understand which counties are covered

**Steps:**
1. Navigate to Admin Panel
2. Review the list of available scrapers
3. Note which counties each scraper covers
4. Check the "Last Run" timestamps

**Expected Result:** You see 16 scrapers covering various NC counties. Some may show "Never" for last run if this is a fresh deployment.

**Scraper coverage:**
- Kania Law Firm: 28 counties
- ZLS Attorneys: 30 counties  
- Custom scrapers: 6 individual counties

### Run Initial Scrape

**Task:** Populate the database with current property data

**Steps:**
1. In Admin Panel, select a scraper to test (start with a small county)
2. Click "Run Now" button
3. Monitor the scraper history for status updates
4. Wait for completion (may take 1-5 minutes depending on county)
5. Navigate to Properties page to verify new properties appeared

**Expected Result:** Scraper completes successfully and properties are added to the database.

**If scraper fails:** Check the scraper history for error messages. Common issues include website changes, network timeouts, or parsing errors. Review logs in Railway for detailed error information.

### Schedule Automated Scraping

**Task:** Set up regular scraping schedules

**Steps:**
1. Determine how often you want to scrape each county (daily, weekly, etc.)
2. Use an external cron service like cron-job.org or EasyCron
3. Create scheduled jobs that call your scraper API endpoints
4. Test the scheduled jobs to ensure they trigger correctly

**Note:** Railway doesn't provide built-in cron scheduling. You'll need to use an external service or implement a scheduler within your application.

**Alternative:** Manually run scrapers as needed from the Admin Panel.

---

## Phase 5: Set Up Notifications

### Configure Notification Preferences

**Task:** Set up alerts for new properties

**Steps:**
1. Navigate to Notification Settings page
2. Select counties you want to monitor
3. Set price range filters (min/max bid)
4. Enable email and/or in-app notifications
5. Choose notification frequency (immediate or daily digest)
6. Save preferences

**Expected Result:** Preferences are saved successfully.

**Testing:** Add a test property manually to the database matching your criteria and verify you receive a notification.

### Verify Email Delivery

**Task:** Ensure email notifications work (if configured)

**Steps:**
1. Check that email service credentials are configured
2. Trigger a test notification
3. Check your email inbox for the notification
4. Verify the email contains property details and links

**Expected Result:** Email arrives within a few minutes with correct property information.

**If emails don't arrive:** Check spam folder. Verify email service credentials are correct. Check application logs for email sending errors.

---

## Phase 6: Team Access

### Add Team Members

**Task:** Give your staff access to the application

**Steps:**
1. Share the application URL with team members
2. If OAuth is enabled: Have them sign in with their accounts
3. If OAuth is disabled: They can access directly without login
4. Verify they can access all necessary features

**Expected Result:** Team members can browse properties, save searches, and add favorites.

### Assign Admin Roles

**Task:** Promote additional users to admin (if needed)

**Steps:**
1. Access Railway's MySQL service
2. Navigate to "Data" tab
3. Open the `users` table
4. Find the user by email or name
5. Change their `role` from `user` to `admin`
6. Save changes

**Expected Result:** User can now access the Admin Panel and manage scrapers.

### Test Permissions

**Task:** Verify role-based access works correctly

**Steps:**
1. Log in as a regular user
2. Attempt to access Admin Panel
3. Verify you're denied access or redirected
4. Log in as an admin
5. Verify Admin Panel is accessible

**Expected Result:** Regular users cannot access Admin Panel. Admins have full access.

---

## Phase 7: Performance & Monitoring

### Set Up Monitoring

**Task:** Configure application health monitoring

**Steps:**
1. In Railway dashboard, navigate to your application service
2. Review the "Metrics" tab
3. Note current CPU, memory, and network usage
4. Set up alerts (if available) for high resource usage or crashes

**Expected Result:** You can see real-time metrics and will be notified of issues.

**Recommended:** Check metrics daily for the first week, then weekly thereafter.

### Test Performance

**Task:** Verify the application responds quickly

**Steps:**
1. Navigate to Properties page
2. Note page load time (should be under 2 seconds)
3. Apply filters and check response time
4. Open Map View and verify it loads within 3-5 seconds
5. Test Statistics page chart rendering speed

**Expected Result:** All pages load quickly. Interactions feel responsive.

**If performance is slow:** Verify database indexes are applied. Check Railway metrics to see if you're hitting resource limits. Consider upgrading your Railway plan.

### Review Resource Usage

**Task:** Ensure you're within plan limits

**Steps:**
1. Check Railway's usage dashboard
2. Note current compute, memory, and database usage
3. Compare against your plan limits
4. Project monthly costs based on current usage

**Expected Result:** Usage is well within limits. Projected costs match expectations (~$5-10/month).

**If usage is high:** Optimize database queries. Reduce scraping frequency. Consider caching strategies.

---

## Phase 8: Backup & Recovery

### Create Initial Backup

**Task:** Back up your database before going live

**Steps:**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Log in: `railway login`
3. Link to your project: `railway link`
4. Export database: `railway run mysqldump -u root -p DATABASE_NAME > backup-initial.sql`
5. Store backup file securely (cloud storage, external drive)

**Expected Result:** You have a complete database backup file.

**Frequency:** Create backups weekly or after significant data changes.

### Test Restore Process

**Task:** Verify you can restore from backup

**Steps:**
1. Create a test database (don't use production)
2. Restore backup: `railway run mysql -u root -p TEST_DATABASE < backup-initial.sql`
3. Verify data restored correctly
4. Delete test database

**Expected Result:** Backup restores successfully without errors.

**Why this matters:** Ensures you can recover from data loss or corruption.

---

## Phase 9: Documentation

### Document Custom Configuration

**Task:** Record your specific setup details

**Steps:**
1. Create a document listing all environment variables you configured
2. Note any custom modifications made to the code
3. Document scraper schedules and frequencies
4. Record admin user accounts
5. Note any third-party services integrated (email, etc.)

**Expected Result:** You have a reference document for future maintenance or troubleshooting.

**Store this document:** Keep it in a secure location separate from your code repository (e.g., password manager, encrypted cloud storage).

### Share User Guide

**Task:** Provide documentation to your team

**Steps:**
1. Locate the `USER_GUIDE.md` file in your repository
2. Convert to PDF or share the markdown file directly
3. Send to all team members
4. Schedule a brief training session to walk through key features

**Expected Result:** Team members understand how to use the application effectively.

---

## Phase 10: Go Live

### Final Verification

**Task:** Complete pre-launch checks

**Checklist:**
- [ ] Application accessible via public URL
- [ ] Database connection working
- [ ] All tables created with indexes applied
- [ ] Admin account configured
- [ ] At least one scraper tested successfully
- [ ] Properties visible in the application
- [ ] Map view displaying markers
- [ ] Statistics dashboard rendering
- [ ] Saved searches and favorites functional
- [ ] Export working
- [ ] Notifications configured
- [ ] Team members have access
- [ ] Initial backup created
- [ ] Documentation complete

**If all items are checked:** You're ready to go live!

### Launch Announcement

**Task:** Inform your team the application is ready

**Steps:**
1. Send email to all team members with:
   - Application URL
   - Link to user guide
   - Your contact info for support questions
2. Schedule optional training session
3. Encourage feedback and bug reports

### Monitor First Week

**Task:** Watch for issues during initial usage

**Steps:**
1. Check Railway logs daily
2. Monitor resource usage
3. Respond quickly to team member questions
4. Track any bugs or feature requests
5. Create backups after first week of use

**Expected Result:** Application runs smoothly with minimal issues.

---

## Troubleshooting Common Post-Deployment Issues

### "Application Error" Message

**Cause:** Application crashed or failed to start

**Solution:**
1. Check Railway logs for error messages
2. Verify all required environment variables are set
3. Ensure database is accessible
4. Try redeploying the application

### Slow Performance

**Cause:** Missing database indexes or resource constraints

**Solution:**
1. Apply database indexes from `add-indexes.sql`
2. Check Railway metrics for resource bottlenecks
3. Consider upgrading Railway plan
4. Optimize scraper frequency

### Scrapers Failing

**Cause:** Target websites changed structure or are blocking requests

**Solution:**
1. Review scraper error logs
2. Check if target website is accessible
3. Update scraper code if website structure changed
4. Implement rate limiting or delays between requests

### Users Can't Log In

**Cause:** OAuth misconfiguration

**Solution:**
1. Verify all OAuth environment variables are correct
2. Check redirect URI matches your deployment URL
3. Ensure `JWT_SECRET` is set
4. Review OAuth provider settings

---

## Ongoing Maintenance Schedule

### Daily Tasks
- Check Railway metrics for anomalies
- Review scraper success rates
- Respond to team member questions

### Weekly Tasks
- Create database backup
- Review application logs for errors
- Check for new properties added
- Monitor resource usage and costs

### Monthly Tasks
- Review team access and permissions
- Update scrapers if websites changed
- Analyze usage patterns
- Plan feature enhancements based on feedback

### Quarterly Tasks
- Rotate `JWT_SECRET` (forces re-authentication)
- Review and optimize database performance
- Update dependencies and security patches
- Conduct team training refresher

---

## Success Metrics

Track these metrics to measure application success:

**Usage Metrics:**
- Number of active users per week
- Properties viewed per day
- Searches performed per day
- Favorites added per week

**Data Metrics:**
- Total properties in database
- Counties with active listings
- Properties added per week
- Scraper success rate

**Performance Metrics:**
- Average page load time
- API response time
- Database query speed
- Uptime percentage

**Cost Metrics:**
- Monthly Railway bill
- Cost per user
- Cost per property tracked

---

## Conclusion

Completing this checklist ensures your NC Tax Deed Property Tracker deployment is production-ready and your team can use it effectively. Regular monitoring and maintenance keep the application running smoothly and prevent issues before they impact users.

If you encounter problems not covered in this checklist, refer to the `DEPLOYMENT.md` guide or check Railway's documentation. For application-specific issues, review the code repository or consult with your development team.

Congratulations on successfully deploying the NC Tax Deed Property Tracker!
