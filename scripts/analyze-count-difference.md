# Scraper Count Analysis: 716 vs 763 (47 property difference)

## Summary
- **Manus.ai Total**: 763 properties
- **Current Scrape**: 716 properties  
- **Difference**: -47 properties (-6.2%)

## Possible Reasons for the 47-Property Gap

### 1. **Timing Differences** (Most Likely)
Properties may have been:
- **Sold/Removed**: Properties sold between Manus.ai scrape and current scrape
- **Added**: New properties listed after Manus.ai scrape (less likely to cause deficit)
- **Status Changed**: Properties moved from "scheduled" to "sold" or "cancelled"

### 2. **Rate Limiting / Timeouts**
Some scrapers may have:
- Hit rate limits on certain county websites
- Timed out before completing full scrape
- Been blocked temporarily by anti-scraping measures

### 3. **Data Validation Differences**
Our scrapers have stricter validation:
- Hutchens scraper now filters invalid rows (empty counties, short addresses)
- Some properties may be rejected due to missing required fields
- Duplicate detection may be more aggressive

### 4. **Scraper-Specific Issues**

#### High-Volume Scrapers to Check:
1. **Kania (408 properties)** - Largest scraper, most likely source of discrepancy
   - Check if all pages were scraped
   - Verify pagination logic
   - Check for timeout issues

2. **Hutchens (196 properties)** - Second largest
   - We added validation that filters invalid rows
   - May be rejecting more properties than Manus.ai

3. **ZLS (33 properties)** - Multi-county scraper
   - Complex dropdown navigation
   - May miss some counties or listings

#### Medium-Volume Scrapers:
- Edgecombe (21 properties)
- Hoke (13 properties)
- Anson, Bladen, Cabarrus, Catawba, Forsyth, Gaston, RBCWB, Rutherford, Wake (8 each)

## Recommended Actions

### 1. Check Railway Logs for Errors
Look for:
```
- Timeout errors
- Rate limiting messages
- Validation rejections
- Incomplete scrapes
```

### 2. Compare County-by-County
Run this query on Railway database:
```sql
SELECT county, COUNT(*) as count 
FROM properties 
GROUP BY county 
ORDER BY county;
```

### 3. Check Specific Scrapers
Focus on the largest scrapers:
- **Kania**: Check if all 408 properties were found
- **Hutchens**: Check validation logs for rejected properties
- **ZLS**: Verify all counties were scraped

### 4. Timing Consideration
If properties were sold/removed between scrapes, this is **expected behavior** and not a bug. The 6.2% difference could be entirely due to:
- Properties sold in the interim
- Listings expired or cancelled
- Normal market activity

## Conclusion

A 47-property difference (6.2%) is relatively small and could be explained by:
1. **Normal market activity** (properties sold/removed) - Most likely
2. **Stricter validation** (intentional improvement)
3. **Minor scraper issues** (timeouts, rate limits)

To determine the exact cause, we need to:
1. Get county-by-county breakdown from Railway
2. Review Railway scraper logs for errors
3. Compare timestamps of both scrapes