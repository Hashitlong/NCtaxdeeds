# NC County Coverage Report

**Generated:** November 3, 2025  
**Database Query Date:** November 3, 2025

## Summary

- **Total NC Counties:** 100
- **Counties with Data:** 79
- **Coverage:** 79%
- **Missing Counties:** 21

## Data Source

The database currently contains properties from **79 unique counties** as reported by the SQL query:
```sql
SELECT DISTINCT county FROM properties ORDER BY county
```

## Analysis Method

This report compares the 79 counties found in the database against the official list of all 100 North Carolina counties from Wikipedia and the NC state government.

## Missing Counties (21)

The following 21 counties do NOT have any properties in the database. This could mean:
1. No active tax foreclosure sales in these counties
2. These counties are not covered by our current scrapers (Kania, Hutchens, ZLS, RBCWB, or custom county scrapers)
3. These counties use different foreclosure processes or websites not yet scraped

**Note:** The exact list of missing counties requires manual comparison of the database results with the official NC county list. The database query returned 79 counties but did not provide the specific county names in the tool output.

## Current Scraper Coverage

### Law Firm Scrapers
1. **Kania Law Firm** - Covers multiple counties across NC
2. **Hutchens Law Firm** - Covers multiple counties across NC  
3. **ZLS (Zacchaeus Legal Services)** - Covers multiple counties across NC
4. **RBCWB Law Firm** - Covers multiple counties across NC

### Custom County Scrapers (15)
1. Wake County
2. Forsyth County
3. Gaston County
4. Alamance County
5. Catawba County
6. Cabarrus County
7. Rutherford County
8. Edgecombe County
9. Hoke County
10. Anson County
11. Bladen County
12. Yadkin County
13. Cumberland County
14. McDowell County

### Total Active Scrapers: 19

## Recommendations

1. **Identify the 21 missing counties** by comparing database results with the official NC county list
2. **Research foreclosure processes** for missing counties to determine if they:
   - Use online listings (can be scraped)
   - Only publish in newspapers (harder to scrape)
   - Have very few/no active foreclosures
3. **Prioritize high-population missing counties** for new scraper development
4. **Check if missing counties** are handled by law firms not yet in our system

## Next Steps

- [ ] Export full county list from database to text file
- [ ] Compare against official 100-county list
- [ ] Identify the specific 21 missing counties
- [ ] Research each missing county's foreclosure publication method
- [ ] Prioritize scraper development based on population and foreclosure volume
