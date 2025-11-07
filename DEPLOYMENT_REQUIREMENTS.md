# NC Tax Deed Property Tracker - Deployment Requirements

**Last Updated:** November 2, 2025  
**Version:** 1.0  
**Purpose:** Complete guide for deploying this application independently on any infrastructure

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Deployment Steps](#deployment-steps)
5. [Hosting Provider Guides](#hosting-provider-guides)
6. [Troubleshooting](#troubleshooting)

---

## 🖥️ System Requirements

### Minimum Server Specifications

**For Small Deployment (< 1000 properties):**
- **CPU:** 1 vCPU (2 GHz)
- **RAM:** 1 GB
- **Storage:** 10 GB SSD
- **Network:** 1 Mbps

**For Production Deployment (1000+ properties):**
- **CPU:** 2 vCPUs (2.5 GHz)
- **RAM:** 2 GB
- **Storage:** 20 GB SSD
- **Network:** 10 Mbps

### Required Software

#### Node.js Environment
```
Node.js: v22.13.0 or higher
npm: v10.x or higher
pnpm: v9.x or higher (recommended package manager)
```

#### Database
```
MySQL: v8.0 or higher
OR
TiDB: v7.0 or higher (MySQL-compatible)
OR
PlanetScale: MySQL-compatible serverless database
```

#### Operating System
```
Ubuntu 22.04 LTS (recommended)
OR
Any Linux distribution with Node.js support
OR
macOS 12+ (for development)
OR
Windows 10/11 with WSL2 (for development)
```

### Development Tools (Optional)
```
Git: v2.30+
Docker: v20.10+ (for containerized deployment)
PM2: v5.3+ (for process management)
Nginx: v1.18+ (for reverse proxy)
```

---

## 🔐 Environment Variables

### Required Variables

#### Database Configuration
```bash
# MySQL/TiDB connection string
# Format: mysql://username:password@host:port/database
DATABASE_URL="mysql://user:password@localhost:3306/nc_tax_deed_tracker"
```

**Example values:**
- Local: `mysql://root:password@localhost:3306/nc_tax_deed`
- PlanetScale: `mysql://user:pass@aws.connect.psdb.cloud/nc_tax_deed?ssl={"rejectUnauthorized":true}`
- AWS RDS: `mysql://admin:pass@mydb.abc123.us-east-1.rds.amazonaws.com:3306/nc_tax_deed`

#### Authentication
```bash
# JWT secret for session signing (generate a random 64-character string)
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long-random-string"

# OAuth server URL (if using Manus OAuth)
OAUTH_SERVER_URL="https://api.manus.im"

# OAuth portal URL for frontend (if using Manus OAuth)
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Application ID (if using Manus OAuth)
VITE_APP_ID="your-app-id"

# Owner information
OWNER_OPEN_ID="your-oauth-user-id"
OWNER_NAME="Your Name"
```

### Optional Variables (Manus-Specific Services)

#### Manus Built-in APIs
```bash
# Backend API access (for LLM, storage, notifications)
BUILT_IN_FORGE_API_KEY="your-backend-api-key"
BUILT_IN_FORGE_API_URL="https://forge.manus.im"

# Frontend API access
VITE_FRONTEND_FORGE_API_KEY="your-frontend-api-key"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
```

**Note:** These are only needed if you want to use Manus's built-in services (LLM, cloud storage, notifications). You can replace them with your own services.

#### Analytics (Optional)
```bash
# Website analytics
VITE_ANALYTICS_WEBSITE_ID="your-analytics-id"
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
```

#### Branding
```bash
# Application title and logo
VITE_APP_TITLE="NC Tax Deed Property Tracker"
VITE_APP_LOGO="https://your-cdn.com/logo.png"
```

### How to Generate Secrets

#### Generate JWT_SECRET
```bash
# Option 1: Using OpenSSL
openssl rand -base64 64

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## 🗄️ Database Setup

### Option 1: Local MySQL

#### Install MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS
brew install mysql

# Start MySQL
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS
```

#### Create Database
```bash
# Log into MySQL
mysql -u root -p

# Create database
CREATE DATABASE nc_tax_deed_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user
CREATE USER 'nc_user'@'localhost' IDENTIFIED BY 'secure_password';

# Grant permissions
GRANT ALL PRIVILEGES ON nc_tax_deed_tracker.* TO 'nc_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

#### Set DATABASE_URL
```bash
DATABASE_URL="mysql://nc_user:secure_password@localhost:3306/nc_tax_deed_tracker"
```

### Option 2: PlanetScale (Recommended for Production)

PlanetScale is a serverless MySQL platform with free tier.

#### Setup Steps
1. Go to https://planetscale.com
2. Create account and new database
3. Click "Connect" → "Node.js"
4. Copy connection string
5. Set as DATABASE_URL

**Advantages:**
- ✅ Free tier: 5 GB storage, 1 billion row reads/month
- ✅ Automatic backups
- ✅ Automatic scaling
- ✅ Built-in branching for safe schema changes
- ✅ No server management

### Option 3: AWS RDS MySQL

#### Create RDS Instance
1. Go to AWS RDS Console
2. Create database → MySQL
3. Choose instance size (t3.micro for free tier)
4. Set master username and password
5. Configure security group (allow port 3306)
6. Note endpoint URL

#### Set DATABASE_URL
```bash
DATABASE_URL="mysql://admin:password@your-db.abc123.us-east-1.rds.amazonaws.com:3306/nc_tax_deed"
```

### Database Schema Migration

After setting up database, run migrations:

```bash
# Install dependencies
pnpm install

# Push schema to database (creates all tables)
pnpm db:push

# Verify tables were created
pnpm db:studio  # Opens Drizzle Studio web UI
```

**Tables Created:**
- `users` - User accounts and authentication
- `properties` - Tax deed property listings
- `counties` - NC county reference data
- `scrape_history` - Scraper run logs

---

## 🚀 Deployment Steps

### Step 1: Download Code

```bash
# Download from Manus Management UI
# OR clone from your Git repository
git clone https://github.com/your-org/nc-tax-deed-scraper.git
cd nc-tax-deed-scraper
```

### Step 2: Install Dependencies

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Step 3: Configure Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit .env file with your values
nano .env
```

**Minimum .env file:**
```bash
DATABASE_URL="mysql://user:pass@host:3306/database"
JWT_SECRET="your-64-character-random-string"
VITE_APP_TITLE="NC Tax Deed Property Tracker"
```

### Step 4: Setup Database

```bash
# Push database schema
pnpm db:push

# Verify connection
pnpm db:studio
```

### Step 5: Build Application

```bash
# Build frontend and backend
pnpm build

# This creates:
# - dist/ - Built frontend files
# - server/ - Backend code (already TypeScript compiled)
```

### Step 6: Start Application

#### Development Mode
```bash
pnpm dev
# Runs on http://localhost:3000
```

#### Production Mode
```bash
# Option 1: Direct start
pnpm start

# Option 2: Using PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Enable auto-start on reboot
```

### Step 7: Configure Reverse Proxy (Production)

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Enable HTTPS with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Step 8: Setup Automated Scraping

The application includes built-in cron scheduling that runs scrapers daily at 2 AM. No additional configuration needed.

**To verify cron is running:**
```bash
# Check logs
pm2 logs nc-tax-deed-scraper

# Look for: "[Cron] Running daily scraper job"
```

---

## 🌐 Hosting Provider Guides

### Vercel (Frontend Only)

**Best for:** Static frontend deployment (requires separate backend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Point API calls to your backend server
```

**Limitations:** Cannot run scrapers or backend on Vercel (serverless functions only)

### Railway (Recommended for Full-Stack)

**Best for:** Complete application with database

#### Setup Steps
1. Go to https://railway.app
2. Create new project
3. Add MySQL database service
4. Add Node.js service
5. Connect GitHub repository
6. Set environment variables
7. Deploy automatically on git push

**Advantages:**
- ✅ Free tier: $5 credit/month
- ✅ Automatic deployments
- ✅ Built-in database
- ✅ Easy scaling

### Render

**Best for:** Simple full-stack deployment

#### Setup Steps
1. Go to https://render.com
2. Create Web Service
3. Connect GitHub repository
4. Set build command: `pnpm install && pnpm build`
5. Set start command: `pnpm start`
6. Add environment variables
7. Create PostgreSQL database (or use external MySQL)

**Advantages:**
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ Easy to use

### AWS (EC2 + RDS)

**Best for:** Full control and scalability

#### Setup Steps
1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.small or larger
   - Configure security group (ports 22, 80, 443, 3000)

2. **Create RDS MySQL Database**
   - MySQL 8.0
   - t3.micro for free tier
   - Note connection string

3. **SSH into EC2**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

4. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

5. **Deploy Application**
```bash
# Clone repository
git clone your-repo-url
cd nc-tax-deed-scraper

# Install dependencies
pnpm install

# Set environment variables
nano .env

# Build
pnpm build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

6. **Configure Nginx** (see Nginx config above)

7. **Setup SSL** (see Let's Encrypt section above)

### DigitalOcean

**Best for:** Simple VPS deployment

Similar to AWS EC2 setup, but with simpler interface:

1. Create Droplet (Ubuntu 22.04)
2. Follow EC2 steps above
3. Use DigitalOcean Managed Database for MySQL (optional)

**Advantages:**
- ✅ Simpler than AWS
- ✅ Predictable pricing ($6/month for basic droplet)
- ✅ Good documentation

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=nc_tax_deed_tracker
      - MYSQL_USER=nc_user
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

#### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🔧 Troubleshooting

### Database Connection Issues

**Problem:** `Error: connect ECONNREFUSED`

**Solutions:**
1. Verify DATABASE_URL is correct
2. Check database server is running
3. Verify firewall allows connection
4. Test connection:
```bash
mysql -h host -u user -p database
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Kill existing process:
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>
```

2. Change port in `.env`:
```bash
PORT=3001
```

### Scraper Failures

**Problem:** Scrapers timing out or failing

**Solutions:**
1. Check internet connection
2. Verify source websites are accessible
3. Increase timeout in scraper config
4. Check logs:
```bash
pm2 logs nc-tax-deed-scraper
```

### Build Failures

**Problem:** `pnpm build` fails

**Solutions:**
1. Clear cache:
```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

2. Check Node.js version:
```bash
node --version  # Should be v22.13.0+
```

3. Check for TypeScript errors:
```bash
pnpm type-check
```

### Memory Issues

**Problem:** Application crashes with out-of-memory errors

**Solutions:**
1. Increase Node.js memory limit:
```bash
NODE_OPTIONS="--max-old-space-size=2048" pnpm start
```

2. Upgrade server RAM
3. Optimize scraper batch sizes

### Authentication Issues

**Problem:** Login not working

**Solutions:**
1. Verify JWT_SECRET is set
2. Check OAuth configuration
3. Clear browser cookies
4. Verify OAUTH_SERVER_URL is accessible

---

## 📞 Support

### Self-Help Resources
- Check application logs: `pm2 logs`
- Review database logs: `mysql -u user -p -e "SHOW PROCESSLIST;"`
- Check system resources: `htop` or `top`

### Common Commands

```bash
# Restart application
pm2 restart nc-tax-deed-scraper

# View logs
pm2 logs --lines 100

# Check status
pm2 status

# Monitor resources
pm2 monit

# Database backup
mysqldump -u user -p database > backup.sql

# Database restore
mysql -u user -p database < backup.sql
```

---

## 🎯 Quick Start Checklist

- [ ] Server with Node.js 22+ installed
- [ ] MySQL 8.0+ database created
- [ ] Environment variables configured in `.env`
- [ ] Dependencies installed (`pnpm install`)
- [ ] Database schema pushed (`pnpm db:push`)
- [ ] Application built (`pnpm build`)
- [ ] Application started (`pnpm start` or PM2)
- [ ] Reverse proxy configured (Nginx)
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Firewall configured (ports 80, 443)
- [ ] Automated backups setup
- [ ] Monitoring configured

---

**Last Updated:** November 2, 2025  
**Document Version:** 1.0  
**Application Version:** bd5b9d7d
