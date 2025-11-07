# Prompt for AI Coding Assistant

Copy and paste this prompt to your AI coding assistant:

---

## Task: Deploy NC Tax Deed Property Tracker to Railway

I need help deploying this NC Tax Deed Property Tracker application to Railway (cloud hosting platform). This is a production-ready full-stack application that needs to be moved from Manus.ai to independent hosting.

### Project Overview

**What this application does:**
- Tracks tax foreclosure properties across 99 of 100 North Carolina counties
- Automated daily scraping from 21 different sources (law firms and county websites)
- Team collaboration features (favorites, notes, ratings)
- Map view, statistics dashboard, admin panel
- Currently has 763 properties in the database

**Technology Stack:**
- Frontend: React 19, Tailwind CSS 4, shadcn/ui
- Backend: Node.js 22, Express 4, tRPC 11
- Database: MySQL 8.0+ / TiDB Cloud
- Scrapers: Puppeteer, Axios, Cheerio

### Important: Read These Files ONLY

**For accurate project information, read these files:**

1. **README.md** - Project overview and documentation guide (START HERE)
2. **PROJECT_FACTS.md** - Verified statistics (21 scrapers, 82-86 county coverage)
3. **DEPLOYMENT.md** - Complete Railway deployment guide (FOLLOW THIS)
4. **NC_COUNTY_SCRAPER_MAP.md** - County coverage reference

**DO NOT read files in `docs/archive/`** - These contain outdated information from development (old scraper counts, coverage numbers). They're archived for historical reference only.

### Current Project Status

- **Scrapers:** 21 total (4 law firms + 14 counties + 3 utilities)
- **Coverage:** 82-86 NC counties (99 of 100 counties have scrapers)
- **Properties:** 763 in database
- **Production Ready:** 85-90% complete
- **Missing:** Only deployment infrastructure (Railway setup)

### What I Need You To Do

**Follow DEPLOYMENT.md step-by-step to:**

1. **Set up GitHub repository** (if not already done)
   - Push all project files to GitHub
   - Verify all files are present

2. **Create Railway account and project**
   - Sign up at railway.app (free trial)
   - Connect GitHub repository
   - Add MySQL database service

3. **Configure environment variables**
   - DATABASE_URL (automatic from Railway)
   - JWT_SECRET (generate random 64-char string)
   - NODE_ENV=production
   - PORT=3000
   - Optional: OAuth variables (can skip for now)

4. **Run database migrations**
   - Install Railway CLI
   - Run `railway run pnpm db:push`
   - Verify tables are created

5. **Verify deployment**
   - Test the application URL
   - Check logs for errors
   - Verify database connection

### Expected Timeline

- **Setup time:** 20-30 minutes
- **Cost:** $5-10/month (Railway free trial to start)

### Key Files You'll Need

- `package.json` - Dependencies and scripts
- `drizzle/schema.ts` - Database schema
- `server/` - Backend code
- `client/` - Frontend code
- `scrapers/` - 21 scraper files

### After Deployment

Once deployed, I'll need to:
1. Run the scrapers to populate the database (`tsx scrapers/kania_scraper.ts`, etc.)
2. Set up daily automation (cron job at 2 AM)
3. Add team members (optional)
4. Configure custom domain (optional)

### Questions to Ask Me

If you need any of these, please ask:
- My GitHub username
- Preferred Railway project name
- Whether I want OAuth authentication (or open access)
- Custom domain name (if I want one)

### Important Notes

- The application is production-ready - no code changes needed
- All 21 scrapers are functional and tested
- The database schema is complete
- The frontend is fully built and responsive
- Focus on deployment infrastructure only

### Success Criteria

Deployment is successful when:
1. Application loads at Railway URL
2. Homepage displays correctly
3. Database connection works (can see empty properties page)
4. No errors in Railway logs
5. I can access all pages (Properties, Map, Statistics, Admin)

### If You See Outdated Information

If you encounter files mentioning "8 scrapers," "14 scrapers," "18 scrapers," or "41 counties," these are outdated. The correct numbers are:
- **21 scrapers**
- **82-86 counties covered**
- **763 properties in database**

Refer to PROJECT_FACTS.md for verified statistics.

---

**Please start by reading README.md and DEPLOYMENT.md, then guide me through the Railway deployment process step-by-step.**
