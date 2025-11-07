# Deployment Guide: NC Tax Deed Property Tracker

**Author:** Manus AI  
**Last Updated:** November 2, 2025  
**Estimated Time:** 20-30 minutes  
**Cost:** ~$5-10/month

This guide provides step-by-step instructions for deploying the NC Tax Deed Property Tracker to production using Railway, making it accessible to your team from anywhere.

---

## Why Railway?

Railway offers the simplest deployment experience for full-stack applications like this one. The platform provides integrated database hosting, automatic deployments from GitHub, and straightforward configuration management. Unlike alternatives that require separate services for database and application hosting, Railway consolidates everything into a single dashboard. The free trial allows you to test the deployment without immediate payment, and the pricing remains predictable at approximately $5-10 per month depending on usage.

---

## Prerequisites

Before beginning the deployment process, ensure you have the following:

- **GitHub Account** - Create one at github.com if you don't have one
- **Railway Account** - Sign up at railway.app (free to start, no credit card required initially)
- **Project Code** - Your NC Tax Deed Property Tracker code pushed to a GitHub repository
- **Admin Access** - You'll need to be the repository owner or have admin permissions

---

## Part 1: Prepare Your GitHub Repository

### Step 1: Create GitHub Repository

Navigate to GitHub and create a new repository for your project. Choose a descriptive name such as "nc-tax-deed-tracker" and set it to private if you want to restrict access. Public repositories are visible to everyone, while private repositories require explicit permission to view.

### Step 2: Push Your Code

If you haven't already pushed your code to GitHub, use the following commands in your project directory:

```bash
git init
git add .
git commit -m "Initial commit - NC Tax Deed Property Tracker"
git remote add origin https://github.com/YOUR_USERNAME/nc-tax-deed-tracker.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username. This sequence initializes a git repository, stages all files, creates an initial commit, connects to your GitHub repository, and pushes the code.

### Step 3: Verify Repository Contents

Confirm that all necessary files are present in your GitHub repository, including the `package.json`, `server` directory, `client` directory, `drizzle` directory, and configuration files. Missing files will cause deployment failures.

---

## Part 2: Set Up Railway

### Step 1: Create Railway Account

Visit railway.app and click "Start a New Project." Sign in using your GitHub account to streamline the connection between Railway and your repositories. Railway will request permission to access your GitHub repositories, which you should grant.

### Step 2: Create New Project

Once logged in, click "New Project" from the Railway dashboard. You'll see several options including "Deploy from GitHub repo," "Provision MySQL," and "Empty Project." Select "Deploy from GitHub repo" to begin.

### Step 3: Connect GitHub Repository

Railway will display a list of your GitHub repositories. Find and select your "nc-tax-deed-tracker" repository. If you don't see it, click "Configure GitHub App" to grant Railway access to additional repositories.

### Step 4: Add MySQL Database

After connecting your repository, Railway will begin deploying your application. However, you need to add a database first. Click "New" in your project dashboard and select "Database" → "Add MySQL." Railway will provision a MySQL database instance within seconds.

The database will appear as a new service in your project dashboard. Click on it to view the connection details, which you'll need in the next section.

---

## Part 3: Configure Environment Variables

Environment variables store sensitive configuration data like database credentials and security keys. Railway makes this process straightforward through its dashboard interface.

### Step 1: Access Variables Panel

In your Railway project dashboard, click on your application service (not the database). Navigate to the "Variables" tab. This is where you'll add all the required configuration.

### Step 2: Add Database Connection

Railway automatically creates a `DATABASE_URL` variable when you add a MySQL database. Verify this variable exists and contains a connection string starting with `mysql://`. If it's missing, click "New Variable" and add it manually using the connection details from your MySQL service.

### Step 3: Add Required Variables

Add the following environment variables by clicking "New Variable" for each one:

**JWT_SECRET**  
This secures your user sessions. Generate a random 64-character string using an online generator or run this command locally: `openssl rand -hex 32`. Paste the result as the value.

**NODE_ENV**  
Set this to `production` to enable production optimizations and disable development-only features.

**PORT**  
Railway automatically assigns this, but you can explicitly set it to `3000` if needed.

### Step 4: Add OAuth Variables (Optional)

If you want user authentication via Manus OAuth, add these variables. Otherwise, you can skip this section and users will access the application without login.

**OAUTH_SERVER_URL**  
Value: `https://api.manus.im`

**VITE_OAUTH_PORTAL_URL**  
Value: `https://portal.manus.im`

**VITE_APP_ID**  
You'll need to register an application at portal.manus.im to get this ID. Follow the OAuth provider's documentation for application registration.

**VITE_APP_TITLE**  
Value: `NC Tax Deed Property Tracker`

**VITE_APP_LOGO**  
Value: URL to your logo image (optional)

### Step 5: Save and Redeploy

After adding all variables, Railway will automatically trigger a redeployment. Monitor the deployment logs in the "Deployments" tab to ensure everything builds successfully.

---

## Part 4: Database Setup

Your application requires database tables to store property data, user information, and notifications. Railway doesn't automatically create these tables, so you need to run migrations.

### Step 1: Access Railway CLI (Optional Method)

Install the Railway CLI on your local machine:

```bash
npm install -g @railway/cli
railway login
railway link
```

This connects your local environment to your Railway project, allowing you to run commands against the production database.

### Step 2: Run Database Migrations

Execute the following command to create all necessary tables:

```bash
railway run pnpm db:push
```

This command uses Drizzle ORM to push your schema to the production database. You should see output confirming the creation of tables like `users`, `properties`, `savedSearches`, `favorites`, `notificationPreferences`, and `notificationHistory`.

### Step 3: Alternative - Manual SQL Execution

If you prefer not to use the CLI, you can execute SQL directly through Railway's database interface. Navigate to your MySQL service in Railway, click "Data," and run the SQL commands from the `add-indexes.sql` file in your repository. This creates the necessary tables and indexes.

---

## Part 5: Verify Deployment

### Step 1: Access Your Application

Railway provides a public URL for your deployed application. Find this in your application service dashboard under "Settings" → "Domains." It will look like `https://your-app-name.up.railway.app`. Click this URL to open your application.

### Step 2: Test Core Features

Verify the following functionality works correctly:

**Homepage Loading** - The main page should display with all navigation buttons visible (Browse Properties, Map View, Statistics, Admin Panel).

**Database Connection** - Navigate to the Properties page. If properties load (or you see an empty state message), the database connection is working.

**Map Functionality** - Visit the Map View page. The map should load and display property markers if you have geocoded properties.

**Statistics Dashboard** - Check the Statistics page to ensure charts render correctly.

**Admin Panel** - Access the Admin Panel to verify scraper controls are functional.

### Step 3: Check Application Logs

Return to Railway and click on your application service. Navigate to the "Logs" tab to view real-time application output. Look for any error messages or warnings. A healthy application will show messages like "Server running on http://localhost:3000" and "Database connected successfully."

### Step 4: Monitor Resource Usage

Railway displays CPU, memory, and network usage in the "Metrics" tab. During normal operation, your application should use minimal resources. Spikes in usage might indicate issues or high traffic.

---

## Part 6: Configure Custom Domain (Optional)

Railway provides a default domain, but you may want to use your own domain name for a more professional appearance.

### Step 1: Purchase Domain

Buy a domain from providers like Namecheap, Google Domains, or Cloudflare. Choose a name that's easy to remember and relevant to your business.

### Step 2: Add Domain in Railway

In your Railway application service, go to "Settings" → "Domains" → "Custom Domain." Enter your domain name (e.g., `taxdeeds.yourdomain.com`).

### Step 3: Configure DNS

Railway will provide DNS configuration instructions. Typically, you'll need to add a CNAME record pointing to Railway's servers. Log into your domain registrar's DNS management panel and add the record as instructed.

DNS propagation can take up to 48 hours, though it usually completes within a few hours. Once propagated, your application will be accessible at your custom domain.

---

## Part 7: Team Access & User Management

### Adding Team Members

Your deployed application supports multiple users through the authentication system. If you configured OAuth, team members can sign in using their accounts. If you skipped OAuth, the application runs in open-access mode where anyone with the URL can use it.

### Admin Access

The first user who signs in with the owner's OpenID (configured in environment variables) automatically receives admin privileges. This user can access the Admin Panel to manage scrapers and view system statistics.

### Regular Users

Additional team members who sign in receive regular user access. They can browse properties, save searches, add favorites, and configure notifications, but cannot access the Admin Panel.

### Managing Permissions

To promote a user to admin, access your Railway MySQL database through the "Data" tab. Find the `users` table, locate the user by email or name, and change their `role` field from `user` to `admin`. The change takes effect immediately upon their next page load.

---

## Part 8: Ongoing Maintenance

### Monitoring Application Health

Railway provides built-in monitoring through the Metrics tab. Check this regularly to ensure your application runs smoothly. Set up alerts in Railway to notify you if the application crashes or experiences high error rates.

### Updating the Application

When you push changes to your GitHub repository's main branch, Railway automatically detects the changes and redeploys your application. This process typically takes 2-5 minutes. Monitor the deployment logs to ensure successful completion.

### Database Backups

Railway automatically backs up your MySQL database, but you should also implement your own backup strategy. Use the Railway CLI to export database snapshots periodically:

```bash
railway run mysqldump -u root -p DATABASE_NAME > backup.sql
```

Store these backups securely off-platform for disaster recovery.

### Scaling Considerations

As your property database grows and more team members use the application, you may need to upgrade your Railway plan. Monitor the "Metrics" tab for resource usage. If you consistently approach plan limits, consider upgrading to a higher tier.

---

## Troubleshooting Common Issues

### Application Won't Start

**Symptom:** Deployment succeeds but application shows "Application Error" when accessed.

**Solution:** Check the logs for error messages. Common causes include missing environment variables, database connection failures, or build errors. Verify all required environment variables are set correctly.

### Database Connection Errors

**Symptom:** Application loads but shows "Failed to fetch properties" or similar database errors.

**Solution:** Verify the `DATABASE_URL` environment variable is correct. Ensure the MySQL service is running in Railway. Check that database migrations have been run using `railway run pnpm db:push`.

### Build Failures

**Symptom:** Deployment fails during the build process.

**Solution:** Review the build logs for specific error messages. Common issues include missing dependencies (run `pnpm install` locally to verify), TypeScript errors, or incorrect Node.js version. Ensure your `package.json` specifies the correct Node version.

### Slow Performance

**Symptom:** Pages load slowly or time out.

**Solution:** Check if database indexes are created (run the `add-indexes.sql` script). Verify you're not hitting Railway plan limits in the Metrics tab. Consider upgrading your plan if resource usage is consistently high.

### OAuth Login Fails

**Symptom:** Users can't log in or receive authentication errors.

**Solution:** Verify all OAuth environment variables are set correctly. Ensure the redirect URI configured in your OAuth provider matches your Railway application URL. Check that the `JWT_SECRET` is set.

---

## Cost Breakdown

Railway charges based on actual resource usage rather than fixed tiers. Here's what to expect:

**Starter Plan (Hobby):** $5/month  
Includes $5 credit that covers most small to medium applications. Suitable for teams of up to 10 users with moderate usage.

**Pro Plan:** $20/month  
Includes $20 credit with higher resource limits. Recommended for teams of 10-50 users or applications with heavy scraping activity.

**Usage-Based Charges:**  
- **Compute:** ~$0.000463 per GB-hour
- **Database:** ~$0.25 per GB per month
- **Network:** First 100GB free, then $0.10 per GB

For this application with typical usage (5-10 team members, daily scraper runs, 1GB database), expect costs around $5-8 per month.

---

## Alternative Deployment Options

While this guide focuses on Railway, you can deploy to other platforms if preferred:

### Vercel + PlanetScale

**Pros:** Vercel offers excellent frontend performance with global CDN. PlanetScale provides a generous free tier for databases.

**Cons:** Requires separate configuration for frontend (Vercel) and backend (Vercel Serverless Functions or separate hosting). More complex setup.

**Cost:** Free tier available, paid plans start at $20/month for Vercel Pro.

### Render

**Pros:** Similar to Railway with integrated database hosting. Offers free tier for testing.

**Cons:** Free tier has limitations (application sleeps after inactivity). Paid plans are comparable to Railway.

**Cost:** Free tier available, paid plans start at $7/month.

### AWS / DigitalOcean

**Pros:** Maximum control and scalability. Professional-grade infrastructure.

**Cons:** Significantly more complex setup requiring technical expertise. Higher learning curve.

**Cost:** Varies widely, typically $20-50/month for comparable resources.

---

## Security Best Practices

### Environment Variables

Never commit environment variables to your GitHub repository. Always use Railway's Variables panel or a `.env` file that's listed in `.gitignore`. Rotate your `JWT_SECRET` periodically (every 6-12 months).

### Database Access

Restrict database access to Railway's internal network. Don't expose the MySQL port publicly unless absolutely necessary. Use strong passwords for database credentials.

### HTTPS

Railway automatically provides HTTPS for all applications. Ensure your custom domain (if configured) also uses HTTPS. Never serve the application over plain HTTP in production.

### User Authentication

If using OAuth, regularly review authorized users in your database. Remove access for team members who leave your organization by deleting their records from the `users` table.

---

## Next Steps

After successful deployment, consider these enhancements:

**Configure Scrapers:** Access the Admin Panel and set up automated scraping schedules for your target counties. Start with a few counties to test the system before scaling up.

**Set Up Notifications:** Have team members configure their notification preferences to receive alerts about new properties matching their criteria.

**Create Saved Searches:** Encourage team members to save commonly used filter combinations for quick access.

**Monitor Performance:** Check Railway metrics weekly to ensure the application performs well and stays within budget.

**Plan Backups:** Establish a regular backup schedule for your database to prevent data loss.

---

## Support Resources

- **Railway Documentation:** docs.railway.app
- **GitHub Issues:** Create issues in your repository for bug tracking
- **Railway Community:** Discord server at railway.app/discord
- **Application Logs:** Always check Railway logs first when troubleshooting

---

## Conclusion

Deploying the NC Tax Deed Property Tracker to Railway provides your team with reliable, accessible access to property data from anywhere. The platform handles infrastructure management, allowing you to focus on using the application rather than maintaining servers. With automatic deployments from GitHub, updates are seamless and require no downtime.

Following this guide, your application should be live and accessible to your team within 30 minutes. Regular monitoring and maintenance ensure continued smooth operation as your property database grows and your team expands.
