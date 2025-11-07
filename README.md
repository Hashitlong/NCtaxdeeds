# NC Tax Deed Property Tracker

**Comprehensive database of tax foreclosure properties across 99 of 100 North Carolina counties.**

Track sale dates, upset bid periods, and property details in one place with automated daily scraping from law firms and county websites.

---

## 🚀 Quick Start

**Choose your deployment path:**

1. **Local Setup** (Run on your computer) → Read [LOCAL_SETUP.md](LOCAL_SETUP.md)
2. **Cloud Deployment** (Railway hosting) → Read [DEPLOYMENT.md](DEPLOYMENT.md)
3. **Quick Reference** (Compare options) → Read [QUICK_START.md](QUICK_START.md)

---

## 📊 Project Statistics

- **21 Scrapers** - 4 law firms + 14 counties + 3 utilities
- **99 of 100 Counties Covered** - Only Randolph County missing
- **82-86% Coverage** - Some counties covered by multiple scrapers
- **763 Properties** - Current database (as of Nov 6, 2025)
- **Daily Automation** - Automatic scraping at 2 AM

See [PROJECT_FACTS.md](PROJECT_FACTS.md) for complete statistics.

---

## 📚 Documentation Guide

### Essential Documentation (Start Here)

| File | Purpose | When to Use |
|------|---------|-------------|
| **PROJECT_FACTS.md** | Single source of truth for statistics | Reference for capabilities and coverage |
| **LOCAL_SETUP.md** | Step-by-step local deployment guide | Running on your own computer |
| **DEPLOYMENT.md** | Railway cloud deployment guide | Deploying to production hosting |
| **QUICK_START.md** | Quick reference for both options | Comparing deployment paths |
| **NC_COUNTY_SCRAPER_MAP.md** | All 100 counties mapped to scrapers | Finding which scraper covers which county |

### Reference Documentation

| File | Purpose |
|------|---------|
| **AUTOMATION_SETUP.md** | How daily scraping automation works |
| **ENVIRONMENT_VARIABLES.md** | Complete list of required environment variables |
| **USER_GUIDE.md** | End-user guide for the web interface |
| **POST_DEPLOYMENT_CHECKLIST.md** | Steps to complete after deployment |
| **FINAL_VERIFICATION_REPORT.md** | Pre-export verification checklist |

### Optional Documentation

| File | Purpose |
|------|---------|
| **AUTH_OPTIONS_DETAILED.md** | Authentication options and configuration |
| **DATABASE_IMPORT_INSTRUCTIONS.md** | Manual database import procedures |
| **DEPLOYMENT_REQUIREMENTS.md** | Detailed server requirements |
| **PERFORMANCE.md** | Performance optimization notes |
| **userGuide.md** | Alternative user guide format |

### Archive (Historical Research)

The `docs/archive/` directory contains 38 research and analysis documents from the development process. These files document:
- County research sessions
- Coverage expansion analysis
- Migration plans from earlier versions
- Debugging notes and investigations

**You don't need these for deployment** - they're kept for historical reference only.

---

## 🗂️ Project Structure

```
nc-tax-deed-scraper/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # tRPC client
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database queries
│   └── _core/             # Framework code
├── scrapers/              # 21 property scrapers
│   ├── kania_scraper.ts   # Law firm scrapers
│   ├── hutchens_scraper.ts
│   ├── zls_scraper.ts
│   ├── rbcwb_scraper.ts
│   └── *_county_scraper.ts # County-specific scrapers
├── drizzle/               # Database schema
│   └── schema.ts
├── docs/
│   └── archive/           # Historical research docs
├── *.md                   # Documentation files
└── package.json           # Dependencies
```

---

## 🎯 What This Application Does

### For Property Investors
- **Browse Properties** - Search and filter 763 foreclosure properties across NC
- **Track Favorites** - Save properties you're interested in (with team collaboration)
- **Monitor Deadlines** - Track upset bid deadlines and sale dates
- **View on Map** - See property locations geographically
- **Export Data** - Download property lists as CSV

### For Teams
- **Team Favorites** - See what your team members have favorited (blue stars vs yellow stars)
- **Shared Database** - Everyone sees the same up-to-date property information
- **Collaboration** - Add notes and ratings to properties

### Automation
- **Daily Scraping** - Automatically fetches new properties every day at 2 AM
- **21 Data Sources** - Monitors law firm websites and county portals
- **Status Tracking** - Updates property status (scheduled, in upset period, sold, cancelled)
- **Change Detection** - Tracks when properties are added, updated, or sold

---

## 💻 Technology Stack

- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui components
- **Backend:** Node.js 22, Express 4, tRPC 11
- **Database:** MySQL 8.0+ / TiDB Cloud
- **Scraping:** Puppeteer (headless Chrome), Axios, Cheerio
- **Maps:** Google Maps JavaScript API
- **Auth:** Manus OAuth (can be replaced with custom auth)

---

## 🔑 Key Features

✅ **Automated Scraping** - 21 scrapers covering 99 of 100 NC counties  
✅ **Team Collaboration** - See what your team members have favorited (blue stars)  
✅ **Map View** - Visualize properties geographically  
✅ **Advanced Search** - Filter by county, property type, price, sale date  
✅ **Upset Bid Tracking** - Monitor NC's unique 10-day upset bid process  
✅ **Export** - Download property data as CSV  
✅ **Admin Panel** - Manage scrapers and view scrape history  
✅ **Daily Automation** - Automatic updates without manual intervention  

---

## 🚦 Getting Started

1. **Read the documentation** - Start with [QUICK_START.md](QUICK_START.md)
2. **Choose deployment path** - Local or cloud
3. **Set up environment** - Database and environment variables
4. **Deploy application** - Follow the step-by-step guide
5. **Run scrapers** - Populate your database with properties
6. **Start using** - Browse properties and track favorites

---

## 📞 Support

For deployment issues:
1. Check the relevant documentation file
2. Review error messages carefully
3. Verify environment variables are correct
4. Ensure database connection is working

---

## 📝 License

Internal tool for property investment research. Not for public distribution.

---

**Last Updated:** November 6, 2025  
**Version:** 2a1dcbf2  
**Status:** ✅ Production Ready
