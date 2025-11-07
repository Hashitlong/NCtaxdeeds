# NC Tax Deed Property Tracker

**Purpose**: Track tax foreclosure properties across all 100 North Carolina counties with automated scraping and comprehensive upset bid monitoring for your investment team.

**Access**: Login required

---

## Powered by Manus

This application is built with cutting-edge technology for maximum performance and reliability. The frontend leverages React 19 with TypeScript for type-safe development, styled with Tailwind CSS 4 and shadcn/ui components for a modern interface. The backend runs on Express 4 with tRPC 11 for end-to-end type safety and Drizzle ORM for database operations. Web scraping is powered by Puppeteer for reliable data extraction from dynamic websites and pdf-parse for PDF document processing. The database uses MySQL/TiDB for scalable storage, and authentication is handled through Manus OAuth for secure access control.

Deployment runs on auto-scaling infrastructure with global CDN for instant access anywhere.

---

## Using Your Website

### Browse Properties

Click "Browse Properties" on the home page to see all tax foreclosure listings. The dashboard shows total properties (500+ listings), counties with active sales (82 counties covered by scrapers across NC), and properties in upset bid periods. Use the search box to find properties by address, county, or parcel ID. Click "All Counties" to filter by specific counties. Click "All Statuses" to filter by scheduled sales or upset bid periods. Click "Export CSV" to download the full property list for offline analysis.

### Monitor Upset Bids

Properties showing "Upset Period" status are in NC's 10-day upset bid window. The "Upset Deadline" column shows when the upset period closes. Current bid amounts update automatically when scrapers run. This helps you identify properties where you can still submit an upset bid before the deadline.

### Run Scrapers

Click "Admin Panel" to access scraper controls. You will see cards for each data source: Kania Law Firm (28 counties), Hutchens Law Firm (64 counties, 190+ properties), ZLS/Zacchaeus Legal Services (30 counties, 160+ properties), RBCWB Law Firm (Mecklenburg County), and individual county scrapers for Wake, McDowell, Forsyth, Gaston, Alamance, Catawba, Cabarrus, Rutherford, and Cumberland counties. Click individual scraper buttons to update specific sources or click "Run All Scrapers" to fetch from all sources at once. The scrape history table shows when each scraper last ran and how many properties were found.

---

## Managing Your Website

Use the Management UI panel on the right side of the screen. Click the "Database" tab to view and edit property records directly. Click the "Settings" tab to update the website name or logo. The "Dashboard" tab shows site analytics after publishing. All scraper operations and property data are managed through the Admin Panel accessible from the home page.

---

## Automated Daily Updates

The system automatically runs all scrapers every day at 2 AM to keep your property database current. Each run imports new properties and updates existing listings with the latest information. Check the Admin Panel's Scrape History to verify daily updates are running successfully. The automation handles all 82 covered counties (82% of NC) without manual intervention. You can still run scrapers manually anytime from the Admin Panel to get immediate updates.

---

## Next Steps

Talk to Manus AI anytime to request changes or add features. You now have 16 working scrapers covering 82 of 100 NC counties (82% coverage) with daily automated updates. The system tracks upset bid deadlines and sale dates automatically across all major NC counties including Buncombe (Asheville), New Hanover (Wilmington), Mecklenburg (Charlotte), Wake (Raleigh), and 78 more counties. Consider requesting email alerts for new properties matching your investment criteria, or adding map visualization to see property locations geographically.

