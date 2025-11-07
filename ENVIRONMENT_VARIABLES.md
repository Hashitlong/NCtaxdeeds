# Environment Variables Guide

**Author:** Manus AI  
**Last Updated:** November 2, 2025

This document explains all environment variables required for deploying the NC Tax Deed Property Tracker. Use this as a reference when configuring your deployment platform (Railway, Vercel, etc.).

---

## Required Variables

These variables are essential for the application to function. Without them, the application will not start or will operate incorrectly.

### DATABASE_URL

**Purpose:** Connection string for your MySQL/TiDB database  
**Format:** `mysql://username:password@host:port/database`  
**Example:** `mysql://root:mypassword@mysql.railway.internal:3306/railway`

**How to get it:**
- **Railway:** Automatically generated when you add a MySQL database service
- **PlanetScale:** Copy from database settings page
- **Local:** `mysql://root:password@localhost:3306/tax_deeds`

### JWT_SECRET

**Purpose:** Secures user session tokens and prevents tampering  
**Format:** Random string, minimum 32 characters  
**Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

**How to generate:**
```bash
# Method 1: Using OpenSSL (Mac/Linux)
openssl rand -hex 32

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**Security Note:** Never reuse JWT secrets across different applications or environments. Generate a unique secret for each deployment.

### NODE_ENV

**Purpose:** Tells the application whether it's running in development or production mode  
**Format:** `development` or `production`  
**Example:** `production`

**Effects:**
- **Production mode:** Enables optimizations, disables debug logging, uses production error handling
- **Development mode:** Enables hot reloading, verbose logging, detailed error messages

**For deployment:** Always set to `production`

---

## Optional Variables (Authentication)

These variables enable user authentication via OAuth. If you skip these, the application runs in open-access mode where anyone with the URL can use it.

### OAUTH_SERVER_URL

**Purpose:** Backend OAuth server endpoint  
**Value:** `https://api.manus.im`  
**Required for:** User login functionality

### VITE_OAUTH_PORTAL_URL

**Purpose:** Frontend OAuth portal URL  
**Value:** `https://portal.manus.im`  
**Required for:** Login button redirect

### VITE_APP_ID

**Purpose:** Your registered application ID from the OAuth provider  
**Format:** UUID or application-specific identifier  
**Example:** `app_1234567890abcdef`

**How to get it:**
1. Visit portal.manus.im
2. Register a new application
3. Copy the generated App ID

### OWNER_OPEN_ID

**Purpose:** OpenID of the application owner (receives admin privileges automatically)  
**Format:** OAuth provider's user identifier  
**Example:** `user_abc123xyz789`

**How to get it:**
1. Sign in to your OAuth provider
2. Check your profile or account settings
3. Copy your OpenID/User ID

### OWNER_NAME

**Purpose:** Display name for the application owner  
**Format:** Plain text string  
**Example:** `John Smith`

---

## Optional Variables (Branding)

These variables customize the application's appearance. They have sensible defaults if not provided.

### VITE_APP_TITLE

**Purpose:** Application name displayed in browser tab and header  
**Default:** `NC Tax Deed Property Tracker`  
**Example:** `Smith Real Estate - Tax Deeds`

**Note:** Can also be configured through the website settings GUI after deployment.

### VITE_APP_LOGO

**Purpose:** URL to your company logo image  
**Format:** Full URL to an image file  
**Example:** `https://yourdomain.com/logo.png`  
**Default:** Placeholder logo

**Image requirements:**
- Format: PNG, JPG, or SVG
- Size: 128x128 pixels recommended
- Hosted on accessible URL (CDN or your domain)

**Note:** Can also be configured through the website settings GUI after deployment.

---

## Optional Variables (Manus Services)

These variables enable integration with Manus built-in services like maps, notifications, and analytics. Only needed if you're using these features.

### BUILT_IN_FORGE_API_URL

**Purpose:** Base URL for Manus API services  
**Value:** `https://api.manus.im`  
**Used for:** Maps, notifications, LLM features

### BUILT_IN_FORGE_API_KEY

**Purpose:** Server-side authentication for Manus APIs  
**Format:** API key provided by Manus  
**Example:** `manus_sk_1234567890abcdef`

**How to get it:**
1. Log into your Manus account
2. Navigate to API settings
3. Generate a server-side API key

**Security:** This is a server-side key. Never expose it in client-side code.

### VITE_FRONTEND_FORGE_API_KEY

**Purpose:** Frontend authentication for Manus APIs  
**Format:** API key provided by Manus  
**Example:** `manus_pk_1234567890abcdef`

**How to get it:**
1. Log into your Manus account
2. Navigate to API settings
3. Generate a public/frontend API key

**Note:** This key is safe to expose in client-side code as it has limited permissions.

### VITE_FRONTEND_FORGE_API_URL

**Purpose:** Base URL for frontend Manus API calls  
**Value:** `https://api.manus.im`

---

## Optional Variables (Analytics)

These variables enable usage tracking and analytics. Useful for monitoring application adoption and performance.

### VITE_ANALYTICS_ENDPOINT

**Purpose:** Analytics service endpoint  
**Value:** `https://analytics.manus.im`  
**Used for:** Tracking page views, user actions

### VITE_ANALYTICS_WEBSITE_ID

**Purpose:** Unique identifier for your website in the analytics system  
**Format:** UUID or website-specific identifier  
**Example:** `website_abc123xyz789`

**How to get it:**
1. Register your website with Manus analytics
2. Copy the generated Website ID

---

## Platform-Specific Configuration

### Railway

Railway provides a Variables panel in each service's settings. Add variables one at a time:

1. Click on your application service
2. Navigate to "Variables" tab
3. Click "New Variable"
4. Enter variable name and value
5. Save (Railway auto-redeploys)

**Auto-generated variables:**
- `DATABASE_URL` - Created when you add MySQL database
- `PORT` - Automatically assigned by Railway

**You must add manually:**
- `JWT_SECRET`
- `NODE_ENV`
- All optional variables you want to use

### Vercel

Vercel uses environment variables in project settings:

1. Go to project settings
2. Navigate to "Environment Variables"
3. Add each variable with appropriate scope (Production, Preview, Development)

**Important:** Vercel requires `VITE_` prefix for client-side variables to be accessible in the frontend.

### Local Development

For local development, create a `.env` file in your project root:

```env
DATABASE_URL="mysql://root:password@localhost:3306/tax_deeds"
JWT_SECRET="your-local-development-secret"
NODE_ENV="development"
```

Add `.env` to your `.gitignore` to prevent committing secrets to version control.

---

## Variable Naming Conventions

### VITE_ Prefix

Variables starting with `VITE_` are accessible in the frontend (client-side) code. These are bundled into the JavaScript during build time. Never put sensitive secrets in `VITE_` variables as they're visible to users.

**Examples:**
- `VITE_APP_TITLE` - Safe (just branding)
- `VITE_OAUTH_PORTAL_URL` - Safe (public URL)
- `VITE_FRONTEND_FORGE_API_KEY` - Safe (limited permissions)

### No Prefix

Variables without `VITE_` prefix are server-side only and never exposed to the frontend.

**Examples:**
- `DATABASE_URL` - Sensitive (database credentials)
- `JWT_SECRET` - Sensitive (session security)
- `BUILT_IN_FORGE_API_KEY` - Sensitive (full API access)

---

## Security Best Practices

### Never Commit Secrets

Add `.env` to your `.gitignore` file to prevent accidentally committing secrets to your repository. If you do commit secrets, immediately:

1. Rotate all exposed secrets (generate new ones)
2. Update your deployment with new secrets
3. Remove the commit from git history using `git filter-branch` or BFG Repo-Cleaner

### Use Different Secrets Per Environment

Generate unique secrets for each environment:
- **Development:** Local secrets for testing
- **Staging:** Separate secrets for pre-production testing
- **Production:** Production-only secrets

This prevents cross-contamination and limits damage if one environment is compromised.

### Rotate Secrets Regularly

Change your `JWT_SECRET` every 6-12 months. This forces all users to re-authenticate but improves security. Schedule rotations during low-usage periods to minimize disruption.

### Limit Access

Only give team members access to secrets they need. Most developers don't need production database credentials. Use platform-specific access controls to restrict who can view or modify environment variables.

---

## Troubleshooting

### Application Won't Start

**Symptom:** Deployment succeeds but application crashes immediately

**Check:**
1. Verify `DATABASE_URL` is set and correct
2. Ensure `JWT_SECRET` is set
3. Confirm `NODE_ENV` is set to `production`
4. Review deployment logs for specific error messages

### Database Connection Fails

**Symptom:** Application starts but shows "Failed to connect to database"

**Check:**
1. Verify `DATABASE_URL` format is correct
2. Ensure database service is running
3. Check if database allows connections from your application's IP
4. Confirm database credentials are valid

### OAuth Login Doesn't Work

**Symptom:** Login button doesn't work or redirects fail

**Check:**
1. Verify all OAuth variables are set (`OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`)
2. Ensure redirect URI in OAuth provider matches your deployment URL
3. Check that `JWT_SECRET` is set (required for session management)

### Frontend Can't Access Variables

**Symptom:** Frontend code can't read environment variables

**Check:**
1. Ensure variable has `VITE_` prefix for frontend access
2. Rebuild application after adding variables (Railway auto-rebuilds, Vercel may need manual trigger)
3. Verify variable is set in correct environment (Production vs Preview)

---

## Quick Reference Table

| Variable | Required | Sensitive | Frontend Access | Default Value |
|----------|----------|-----------|-----------------|---------------|
| DATABASE_URL | Yes | Yes | No | None |
| JWT_SECRET | Yes | Yes | No | None |
| NODE_ENV | Yes | No | No | development |
| PORT | No | No | No | 3000 |
| OAUTH_SERVER_URL | No | No | No | None |
| VITE_OAUTH_PORTAL_URL | No | No | Yes | None |
| VITE_APP_ID | No | No | Yes | None |
| OWNER_OPEN_ID | No | No | No | None |
| OWNER_NAME | No | No | No | None |
| VITE_APP_TITLE | No | No | Yes | NC Tax Deed Property Tracker |
| VITE_APP_LOGO | No | No | Yes | Placeholder |
| BUILT_IN_FORGE_API_URL | No | No | No | None |
| BUILT_IN_FORGE_API_KEY | No | Yes | No | None |
| VITE_FRONTEND_FORGE_API_KEY | No | No | Yes | None |
| VITE_FRONTEND_FORGE_API_URL | No | No | Yes | None |
| VITE_ANALYTICS_ENDPOINT | No | No | Yes | None |
| VITE_ANALYTICS_WEBSITE_ID | No | No | Yes | None |

---

## Conclusion

Proper environment variable configuration is essential for secure and functional deployment. Start with the required variables (`DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`) to get a basic deployment running, then add optional variables as needed for authentication, branding, and advanced features.

Always treat sensitive variables as secrets, never commit them to version control, and rotate them regularly. Use your deployment platform's built-in secrets management rather than hardcoding values in your application code.
