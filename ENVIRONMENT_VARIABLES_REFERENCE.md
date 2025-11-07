# Environment Variables Reference

**Last Updated:** November 2, 2025  
**Purpose:** Complete list of all environment variables for independent deployment

---

## 📋 Quick Reference

### Required Variables (Minimum to Run)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | MySQL connection string | `mysql://user:pass@host:3306/database` |
| `JWT_SECRET` | ✅ Yes | Session signing secret (64+ chars) | `openssl rand -base64 64` |

### Authentication Variables (If Using Manus OAuth)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `OAUTH_SERVER_URL` | ✅ Yes | OAuth server URL | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | ✅ Yes | OAuth login portal URL | `https://portal.manus.im` |
| `VITE_APP_ID` | ✅ Yes | Application ID | `your-app-id` |
| `OWNER_OPEN_ID` | ✅ Yes | Owner's OAuth user ID | `your-user-id` |
| `OWNER_NAME` | ⚠️ Optional | Owner's display name | `John Doe` |

### Optional Manus Services

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BUILT_IN_FORGE_API_KEY` | ⚠️ Optional | Backend API key for Manus services | `your-api-key` |
| `BUILT_IN_FORGE_API_URL` | ⚠️ Optional | Manus API endpoint | `https://forge.manus.im` |
| `VITE_FRONTEND_FORGE_API_KEY` | ⚠️ Optional | Frontend API key | `your-frontend-key` |
| `VITE_FRONTEND_FORGE_API_URL` | ⚠️ Optional | Frontend API endpoint | `https://forge.manus.im` |

### Branding & Analytics

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_APP_TITLE` | ⚠️ Optional | Application title | `NC Tax Deed Property Tracker` |
| `VITE_APP_LOGO` | ⚠️ Optional | Logo URL | `https://cdn.com/logo.png` |
| `VITE_ANALYTICS_WEBSITE_ID` | ⚠️ Optional | Analytics site ID | `your-analytics-id` |
| `VITE_ANALYTICS_ENDPOINT` | ⚠️ Optional | Analytics endpoint | `https://analytics.manus.im` |

---

## 🔐 Detailed Variable Descriptions

### DATABASE_URL

**Purpose:** Connection string for MySQL/TiDB database

**Format:**
```
mysql://username:password@host:port/database?options
```

**Examples:**

**Local MySQL:**
```bash
DATABASE_URL="mysql://root:password@localhost:3306/nc_tax_deed_tracker"
```

**PlanetScale (with SSL):**
```bash
DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/nc_tax_deed?ssl={\"rejectUnauthorized\":true}"
```

**AWS RDS:**
```bash
DATABASE_URL="mysql://admin:SecurePass123@mydb.abc123.us-east-1.rds.amazonaws.com:3306/nc_tax_deed"
```

**DigitalOcean Managed Database:**
```bash
DATABASE_URL="mysql://doadmin:pass@db-mysql-nyc1-12345.ondigitalocean.com:25060/nc_tax_deed?ssl-mode=REQUIRED"
```

**Connection Options:**
- `ssl={"rejectUnauthorized":true}` - Enable SSL with certificate validation
- `ssl-mode=REQUIRED` - Require SSL connection
- `charset=utf8mb4` - Use UTF-8 character set
- `timezone=Z` - Use UTC timezone

**Security Notes:**
- ⚠️ Never commit DATABASE_URL to Git
- ⚠️ Use strong passwords (16+ characters, mixed case, numbers, symbols)
- ⚠️ Enable SSL for production databases
- ⚠️ Restrict database access by IP address when possible

---

### JWT_SECRET

**Purpose:** Secret key for signing JWT tokens used in session management

**Requirements:**
- Minimum 32 characters (recommended 64+)
- Random, unpredictable string
- Keep secret - never expose to frontend

**Generate Strong Secret:**

```bash
# Option 1: OpenSSL (recommended)
openssl rand -base64 64

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Option 3: Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Option 4: Online tool
# Visit: https://generate-secret.vercel.app/64
```

**Example:**
```bash
JWT_SECRET="xK9mP2vL8qR4wN6tY1jH3sF5gD7aZ0bC4eX8yU2iO6pM9nV1kQ3rT5wL7hJ4fG6sA8dZ0bN2mX5cV7yU9iO1pQ3rT5wL7hJ4fG6sA"
```

**Security Notes:**
- ⚠️ Generate a NEW secret for each environment (dev, staging, prod)
- ⚠️ Never reuse JWT_SECRET across projects
- ⚠️ Rotate secrets periodically (every 90 days recommended)
- ⚠️ If compromised, regenerate immediately (will log out all users)

---

### OAUTH_SERVER_URL

**Purpose:** Backend URL for OAuth authentication server

**Default (Manus):**
```bash
OAUTH_SERVER_URL="https://api.manus.im"
```

**Custom OAuth Server:**
If you implement your own OAuth server, point to your server:
```bash
OAUTH_SERVER_URL="https://auth.yourdomain.com"
```

**Used For:**
- User authentication
- Token validation
- User profile retrieval

---

### VITE_OAUTH_PORTAL_URL

**Purpose:** Frontend URL for OAuth login portal

**Default (Manus):**
```bash
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
```

**Custom OAuth Portal:**
```bash
VITE_OAUTH_PORTAL_URL="https://login.yourdomain.com"
```

**Note:** `VITE_` prefix means this variable is exposed to frontend JavaScript. Don't put secrets here.

---

### VITE_APP_ID

**Purpose:** Unique identifier for your application in the OAuth system

**Format:** String (typically alphanumeric)

**Example:**
```bash
VITE_APP_ID="nc-tax-deed-tracker-prod"
```

**How to Get:**
- Manus: Automatically assigned when project is created
- Custom OAuth: Register your app in your OAuth provider

---

### OWNER_OPEN_ID

**Purpose:** OAuth user ID of the application owner (you)

**Used For:**
- Granting admin privileges
- Sending system notifications
- Owner-only features

**Example:**
```bash
OWNER_OPEN_ID="user_abc123xyz789"
```

**How to Find:**
- Manus: Check your profile in Manus dashboard
- Custom OAuth: Your user ID in your OAuth system

---

### OWNER_NAME

**Purpose:** Display name of the application owner

**Example:**
```bash
OWNER_NAME="John Doe"
```

**Used For:**
- Display in admin panel
- System notifications
- Audit logs

---

### BUILT_IN_FORGE_API_KEY

**Purpose:** Server-side API key for Manus built-in services (LLM, storage, notifications)

**Example:**
```bash
BUILT_IN_FORGE_API_KEY="sk_live_abc123xyz789..."
```

**Services Enabled:**
- LLM/AI features
- Cloud storage (S3-compatible)
- Push notifications
- Image generation

**Alternatives:**
If not using Manus services, you can use:
- **LLM:** OpenAI API, Anthropic Claude, local LLMs
- **Storage:** AWS S3, Cloudflare R2, DigitalOcean Spaces
- **Notifications:** SendGrid, Twilio, Firebase
- **Images:** DALL-E, Midjourney, Stable Diffusion

**Security:**
- ⚠️ Server-side only - never expose to frontend
- ⚠️ Rotate keys periodically
- ⚠️ Monitor usage for unexpected spikes

---

### BUILT_IN_FORGE_API_URL

**Purpose:** Endpoint URL for Manus built-in services

**Default:**
```bash
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
```

**Custom Endpoint:**
If you're using custom services, point to your API:
```bash
BUILT_IN_FORGE_API_URL="https://api.yourdomain.com"
```

---

### VITE_FRONTEND_FORGE_API_KEY

**Purpose:** Client-side API key for frontend access to Manus services

**Example:**
```bash
VITE_FRONTEND_FORGE_API_KEY="pk_live_abc123xyz789..."
```

**Note:** This is a **public** key (exposed to frontend). Should have limited permissions.

**Used For:**
- Client-side file uploads
- Frontend analytics
- Public API calls

---

### VITE_FRONTEND_FORGE_API_URL

**Purpose:** Frontend endpoint URL for Manus services

**Default:**
```bash
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
```

---

### VITE_APP_TITLE

**Purpose:** Application title shown in browser tab, header, and login page

**Default:**
```bash
VITE_APP_TITLE="NC Tax Deed Property Tracker"
```

**Examples:**
```bash
VITE_APP_TITLE="NC Tax Foreclosures"
VITE_APP_TITLE="Carolina Property Tracker"
VITE_APP_TITLE="Tax Deed Investment Tool"
```

**Where It Appears:**
- Browser tab title
- Page header
- Login dialog
- Email notifications

---

### VITE_APP_LOGO

**Purpose:** URL to application logo image

**Example:**
```bash
VITE_APP_LOGO="https://cdn.yourdomain.com/logo.png"
```

**Requirements:**
- Public URL (accessible without authentication)
- Recommended size: 200x200px or larger
- Supported formats: PNG, SVG, JPG
- Transparent background recommended (PNG or SVG)

**Where It Appears:**
- Page header
- Login dialog
- Email notifications
- Favicon (if configured)

---

### VITE_ANALYTICS_WEBSITE_ID

**Purpose:** Unique identifier for website analytics tracking

**Example:**
```bash
VITE_ANALYTICS_WEBSITE_ID="site_abc123xyz789"
```

**Used By:**
- Manus Analytics
- Google Analytics
- Plausible Analytics
- Custom analytics solutions

---

### VITE_ANALYTICS_ENDPOINT

**Purpose:** Analytics service endpoint URL

**Default (Manus):**
```bash
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
```

**Alternatives:**
```bash
# Google Analytics
VITE_ANALYTICS_ENDPOINT="https://www.google-analytics.com/collect"

# Plausible
VITE_ANALYTICS_ENDPOINT="https://plausible.io/api/event"

# Self-hosted
VITE_ANALYTICS_ENDPOINT="https://analytics.yourdomain.com"
```

---

## 🔧 Additional Configuration

### Optional Server Variables

These can be set but have defaults:

```bash
# Server port (default: 3000)
PORT=3000

# Node environment (default: development)
NODE_ENV=production

# Log level (default: info)
LOG_LEVEL=debug

# Enable debug mode (default: false)
DEBUG=true
```

---

## 📝 Environment File Template

Create a `.env` file in your project root:

```bash
# ============================================================================
# REQUIRED - Minimum to run the application
# ============================================================================
DATABASE_URL="mysql://user:pass@host:3306/database"
JWT_SECRET="your-64-character-random-string-here"

# ============================================================================
# AUTHENTICATION - Required if using Manus OAuth
# ============================================================================
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
VITE_APP_ID="your-app-id"
OWNER_OPEN_ID="your-user-id"
OWNER_NAME="Your Name"

# ============================================================================
# OPTIONAL - Manus Services (can be replaced with alternatives)
# ============================================================================
BUILT_IN_FORGE_API_KEY="your-backend-api-key"
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
VITE_FRONTEND_FORGE_API_KEY="your-frontend-api-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"

# ============================================================================
# OPTIONAL - Branding & Analytics
# ============================================================================
VITE_APP_TITLE="NC Tax Deed Property Tracker"
VITE_APP_LOGO="https://your-cdn.com/logo.png"
VITE_ANALYTICS_WEBSITE_ID="your-analytics-id"
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
```

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets to Git

Add to `.gitignore`:
```
.env
.env.local
.env.production
.env.*.local
```

### 2. Use Different Secrets Per Environment

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

### 3. Rotate Secrets Regularly

- JWT_SECRET: Every 90 days
- API Keys: Every 180 days
- Database passwords: Every 180 days

### 4. Use Secret Management Tools

For production:
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Google Secret Manager**

### 5. Limit Secret Access

- Only give secrets to people who need them
- Use read-only access when possible
- Audit secret access regularly

---

## 📚 Additional Resources

- **Generate Secrets:** https://generate-secret.vercel.app/
- **Environment Variables Guide:** https://12factor.net/config
- **Security Best Practices:** https://owasp.org/www-project-top-ten/

---

**Last Updated:** November 2, 2025  
**Document Version:** 1.0
