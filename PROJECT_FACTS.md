# NC Tax Deed Property Tracker - Verified Project Facts

**Last Verified:** November 6, 2025  
**Purpose:** Single source of truth for accurate project statistics

---

## Scrapers (21 Total)

### County-Specific Scrapers (14)
1. Alamance County
2. Anson County
3. Bladen County
4. Cabarrus County
5. Catawba County
6. Cumberland County
7. Edgecombe County
8. Forsyth County (2 versions: forsyth_county_scraper.ts and forsyth_scraper.ts)
9. Gaston County
10. Hoke County
11. McDowell County
12. Rutherford County
13. Wake County
14. Yadkin County

### Law Firm / Service Scrapers (7)
1. **Kania Law Firm** (kania_scraper.ts) - Covers 28 counties
2. **Hutchens Law Firm** (hutchens_scraper.ts) - Covers 64+ counties
3. **RBCWB Law Firm** (rbcwb_scraper.ts) - Covers Mecklenburg County
4. **ZLS/Zacchaeus Legal Services** (3 components):
   - zls_scraper.ts (main scraper)
   - zls_notice_fetcher.ts (fetches notices)
   - zls_notice_extractor.ts (extracts data)
   - Covers 30 counties

### Utility Files (Not Scrapers)
- types.ts (TypeScript type definitions)
- pdf_parser.ts (PDF parsing utility)

---

## Coverage Statistics

**Total NC Counties:** 100

**Counties Covered by Scrapers:** 82-86 counties (varies as law firms add/remove listings)
- Kania Law Firm: 28 counties
- Hutchens Law Firm: 64+ counties  
- ZLS: 30 counties
- County-specific scrapers: 14 counties
- RBCWB: 1 county (Mecklenburg)
- Note: Some overlap exists between sources

**Counties with Active Listings:** Varies (currently 43 counties have active properties in database)

**Total Properties in Database:** 763 properties (as of Nov 6, 2025)

---

## Technology Stack

### Backend
- **Runtime:** Node.js 22+
- **Framework:** Express 4
- **API Layer:** tRPC 11
- **Database ORM:** Drizzle ORM
- **Database:** MySQL 8.0+ / TiDB Cloud compatible
- **Web Scraping:** Axios + Cheerio (HTTP), Puppeteer (for JavaScript-heavy sites)

### Frontend
- **Framework:** React 19
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** TanStack Query (via tRPC)
- **Routing:** Wouter
- **Maps:** Google Maps JavaScript API

### Development Tools
- **Package Manager:** pnpm
- **Build Tool:** Vite
- **TypeScript:** 5.x
- **Database Migrations:** Drizzle Kit

---

## Features

### Core Features
✅ Property browsing and search
✅ Interactive map view with property markers
✅ Favorites system (personal + team favorites)
✅ Saved searches
✅ Statistics dashboard
✅ Recently sold properties tracking
✅ Notification system
✅ Admin panel for scraper management

### Data Sources
✅ Kania Law Firm (28 counties)
✅ Hutchens Law Firm (64+ counties)
✅ Zacchaeus Legal Services / ZLS (30 counties)
✅ RBCWB Law Firm (Mecklenburg)
✅ 14 individual county websites

### Automation
✅ Daily automated scraping
✅ Upset bid deadline tracking
✅ Property status updates
✅ Email notifications (configurable)

---

## Database Schema

### Main Tables
- **properties** - Tax deed property listings
- **users** - User accounts and authentication
- **favorites** - User-favorited properties
- **savedSearches** - Saved search criteria
- **notificationPreferences** - User notification settings
- **notificationHistory** - Notification delivery log

### Key Fields in Properties Table
- Basic info: address, county, parcelId, propertyType
- Financial: openingBidCents, currentBidCents, arvCents
- Dates: saleDate, upsetBidDeadline, firstListedAt
- Status: saleStatus (scheduled, in_upset_period, sold, cancelled)
- Metadata: sourceUrl, sourceType, scrapedAt
- Location: latitude, longitude (for map view)
- User data: rating, userNotes, ratedAt, ratedBy

---

## Environment Variables Required

### Essential (Required for Basic Operation)
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Session security key (64+ random characters)
- `OWNER_OPEN_ID` - Admin user email/ID
- `OWNER_NAME` - Admin user name
- `NODE_ENV` - "development" or "production"
- `PORT` - Server port (default: 3000)

### Branding
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo URL/path

### Optional (Manus Platform Features)
- `VITE_APP_ID` - Manus OAuth app ID
- `OAUTH_SERVER_URL` - OAuth server URL
- `VITE_OAUTH_PORTAL_URL` - OAuth portal URL
- `BUILT_IN_FORGE_API_URL` - Manus API URL (backend)
- `BUILT_IN_FORGE_API_KEY` - Manus API key (backend)
- `VITE_FRONTEND_FORGE_API_KEY` - Manus API key (frontend)
- `VITE_FRONTEND_FORGE_API_URL` - Manus API URL (frontend)

### Analytics (Optional)
- `VITE_ANALYTICS_WEBSITE_ID` - Analytics tracking ID
- `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint URL

---

## System Requirements

### Minimum
- **OS:** Windows 10/11, macOS 10.15+, Ubuntu 20.04+
- **RAM:** 4 GB
- **Disk:** 2 GB free space
- **Node.js:** 22.x or higher
- **Database:** MySQL 8.0+ or TiDB Cloud

### Recommended
- **RAM:** 8 GB
- **Disk:** 5 GB free space
- **Internet:** Stable connection for scraping

---

## Deployment Options

### Option 1: Local Development
- **Cost:** Free (except database hosting if using TiDB Cloud)
- **Access:** localhost only (or local network)
- **Best for:** Testing, development, customization
- **Setup Time:** 30-45 minutes
- **Guide:** LOCAL_SETUP.md

### Option 2: Cloud Deployment (Railway)
- **Cost:** ~$5-10/month
- **Access:** Public URL, accessible anywhere
- **Best for:** Production use, team collaboration
- **Setup Time:** 20-30 minutes
- **Guide:** DEPLOYMENT.md

---

## Known Limitations

1. **OAuth Dependency:** Default authentication uses Manus OAuth, which requires Manus platform. For independent deployment, you'll need to implement alternative authentication or run in open-access mode.

2. **Scraper Maintenance:** County websites change frequently. Scrapers may break and require updates.

3. **Rate Limiting:** Some county websites have rate limits. Scrapers include delays to avoid being blocked.

4. **Data Accuracy:** Property data is scraped from public websites. Always verify critical information with the source.

5. **Geographic Coverage:** Not all 100 NC counties have online tax deed listings. Maximum realistic coverage is 82-86 counties.

---

## Recent Changes (November 2025)

- ✅ Added team favorites feature (blue stars for team member favorites)
- ✅ Fixed star icon fill issue (yellow vs blue stars now display correctly)
- ✅ Moved Browse Properties button to tab section on Favorites page
- ✅ Created comprehensive deployment documentation (LOCAL_SETUP.md, QUICK_START.md)
- ✅ Added interactive setup script (setup-local.js)

---

## Support & Documentation

- **Quick Start:** QUICK_START.md
- **Local Setup:** LOCAL_SETUP.md (detailed beginner-friendly guide)
- **Cloud Deployment:** DEPLOYMENT.md (Railway deployment guide)
- **User Guide:** USER_GUIDE.md
- **Project Facts:** PROJECT_FACTS.md (this file)

---

**Last Updated:** November 6, 2025  
**Verified By:** Manus AI  
**Next Review:** Update when scrapers are added/removed or major features change
