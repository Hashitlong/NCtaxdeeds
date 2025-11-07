# Daily Automated Scraping Setup

## Overview
The NC Tax Deed Property Tracker includes a daily automated scraping system that runs all configured scrapers once per day to keep your property database up-to-date.

## How It Works
- **Schedule**: Runs automatically at 2 AM daily via Manus scheduling system
- **Script**: `scripts/daily-scrape.mjs`
- **Endpoint**: Internal cron endpoint at `/api/internal/cron/scrape`
- **Authentication**: Protected by internal secret key (`CRON_SECRET`)
- **Duration**: 10-20 minutes per run (21 scrapers, some using Puppeteer)
- **Action**: Runs all 21 scrapers (4 law firms + 14 counties + 3 utilities) and imports new/updated properties into the database
- **Logging**: Outputs results with timestamps and property counts

## Current Scrapers (21 total)

### Law Firm Scrapers (4)
1. **Kania Law Firm** - Covers 28 NC counties
2. **Hutchens Law Firm** - Covers 64+ NC counties
3. **ZLS / Zacchaeus Legal Services** - Covers 30 NC counties
4. **RBCWB Law Firm** - Mecklenburg County

### County-Specific Scrapers (14)
5. **Alamance County** - Direct county website
6. **Anson County** - PDF parser
7. **Bladen County** - PDF parser
8. **Cabarrus County** - County foreclosure portal
9. **Catawba County** - Direct county website
10. **Cumberland County** - Direct county website
11. **Edgecombe County** - Direct county website
12. **Forsyth County** - Direct county website
13. **Gaston County** - Direct county website
14. **Hoke County** - Direct county website
15. **McDowell County** - Direct county website
16. **Rutherford County** - Direct county website
17. **Wake County** - Direct county website (Raleigh)
18. **Yadkin County** - Direct county website

### Utility Scrapers (3)
19. **ZLS Fetcher** - Data retrieval component
20. **ZLS Extractor** - Data parsing component
21. **ZLS Main** - Orchestration component

## Total Coverage
- **82-86 NC counties** (82-86% of 100 counties)
- **Current properties**: 763 properties in database
- **Update frequency**: Daily at 2 AM
- **Note**: Some counties covered by multiple scrapers (dual/triple coverage)

## Technical Implementation

### Internal Cron Endpoint
The system uses an internal HTTP endpoint for automation:
- **URL**: `POST /api/internal/cron/scrape`
- **Authentication**: Requires `x-cron-secret` header or `?secret=` query parameter
- **Response**: JSON with success status, property count, and timestamp
- **Timeout**: None (scrapers can take 5-10 minutes)

### Daily Scrape Script
Located at `scripts/daily-scrape.mjs`, this Node.js script:
1. Calls the internal cron endpoint with authentication
2. Waits for all scrapers to complete
3. Logs results and property counts
4. Exits with status code 0 (success) or 1 (failure)

### Scheduled Task
The Manus scheduling system runs the script daily at 2 AM:
- **Name**: "Daily NC Tax Deed Property Scraping"
- **Schedule**: 2:00 AM every day (cron: `0 0 2 * * *`)
- **Command**: `node scripts/daily-scrape.mjs`
- **Working Directory**: `/home/ubuntu/nc-tax-deed-scraper`

## Manual Execution

### Run via Script
To run the daily scrape manually:

```bash
cd /home/ubuntu/nc-tax-deed-scraper
node scripts/daily-scrape.mjs
```

### Run via API
You can also call the endpoint directly:

```bash
curl -X POST http://localhost:3000/api/internal/cron/scrape \
  -H "x-cron-secret: internal-cron-secret-2024" \
  -H "Content-Type: application/json"
```

### Run via Admin Panel
The easiest way to manually run scrapers:
1. Navigate to the Admin Panel in the web interface
2. Click "Run All Scrapers" button
3. View results in the Scrape History table

## Monitoring

### Check Scrape History
- **Admin Panel**: View recent scraper runs with timestamps and property counts
- **Database**: Query the `scrape_history` table for detailed logs
- **Properties Page**: Verify new properties appear after each run

### Verify Automation
To confirm the daily automation is working:
1. Check the Admin Panel the day after setup
2. Look for a scrape run timestamped around 2 AM
3. Verify the property count increased (if new listings exist)

### Troubleshooting
- **No new properties**: Some counties may have no active foreclosures on a given day
- **Scraper failures**: Check county website changes or network issues
- **Database errors**: Verify database connection and schema
- **Authentication errors**: Ensure `CRON_SECRET` environment variable matches

## Performance Notes

### Expected Duration
- **Single scraper**: 30-90 seconds
- **All scrapers**: 10-20 minutes total
- **Law firm scrapers**: Longer (cover multiple counties, 2-5 minutes each)
- **Individual counties**: Faster (10-30 seconds each)
- **PDF parsers**: Variable (depends on PDF size, 1-2 minutes)

### Why It Takes Time
Each scraper uses Puppeteer (headless Chrome) to:
1. Launch a browser instance
2. Navigate to the source website
3. Wait for dynamic content to load
4. Extract property data
5. Close the browser

This is necessary because most county websites use JavaScript to render content.

## Adding More Counties

As you add more county scrapers:
1. Build the scraper in `server/scrapers/` directory
2. Add to `scraperService.ts` scraper map
3. Add to `routers.ts` enum for manual execution
4. Add scraper card to Admin Panel UI
5. The daily automation will automatically include it (runs 'all' scrapers)

## Future Enhancements

### Planned Features
- Email notifications when new properties are found
- Slack/webhook integrations for alerts
- Differential updates (only import changes)
- Individual scraper schedules (some counties update weekly vs daily)
- Scraper health monitoring and automatic retries
- Property change tracking (price updates, status changes)

### Scaling Considerations
- Current system handles 82-86 counties efficiently
- Already at near-maximum coverage (99 of 100 counties have scrapers)
- May need parallel scraping for faster execution at scale
- Consider caching county website responses to reduce load

## Security

### Internal Endpoint Protection
The cron endpoint is protected by:
- **Secret key authentication**: Prevents unauthorized access
- **Internal-only design**: Not exposed in public API documentation
- **No user data required**: Runs independently of user sessions

### Secret Management
The `CRON_SECRET` is:
- Stored as an environment variable
- Not committed to version control
- Defaults to `internal-cron-secret-2024` if not set
- Can be changed via environment configuration
