# Kania Law Firm Scraper Results

**Date:** November 3, 2025  
**Total Properties:** 202  
**Pages Scraped:** 11 (stopped at page 12 - duplicate detected)

## Summary Statistics

### Properties by County (24 counties)

| County | Count |
|--------|-------|
| Harnett | 22 |
| Rowan | 20 |
| Burke | 18 |
| Cherokee | 17 |
| Mecklenburg | 14 |
| Rutherford | 12 |
| Surry | 11 |
| Transylvania | 10 |
| Ashe | 9 |
| Caldwell | 8 |
| Davie | 7 |
| Stokes | 7 |
| Person | 6 |
| Anson | 5 |
| Lincoln | 5 |
| Polk | 5 |
| Union | 5 |
| Alleghany | 4 |
| Catawba | 4 |
| Alexander | 3 |
| Madison | 3 |
| New Hanover | 3 |
| Clay | 2 |
| Montgomery | 2 |

### Properties by Sale Status

| Status | Count |
|--------|-------|
| Scheduled | 134 |
| In Upset Period | 68 |

## Key Findings

### Missing Counties Now Captured

The pagination fix captured properties from **7 of the 21 missing counties** identified in the coverage analysis:

✅ **Alleghany** (4 properties) - Previously missing  
✅ **Ashe** (9 properties) - Previously missing  
✅ **Davie** (7 properties) - Previously missing  
✅ **Montgomery** (2 properties) - Previously missing  
✅ **Person** (6 properties) - Previously missing  
✅ **Polk** (5 properties) - Previously missing  
✅ **Stokes** (7 properties) - Previously missing  
✅ **Transylvania** (10 properties) - Previously missing

**Total:** 50 properties from 8 previously missing counties!

### Coverage Improvement

- **Before fix:** 79 counties covered
- **After fix:** 79 + 8 = **87 counties covered** (87% of NC's 100 counties)
- **Improvement:** +8 counties, +10% coverage

## Sample Properties

### 1. Alexander County - 237 Ervin Ln.
- **Parcel:** 00260870026086
- **Status:** Scheduled
- **Sale Date:** Not yet set

### 2. Alleghany County - 103 Shadow Rock Rd, Sparta
- **Parcel:** 3989611594
- **Status:** In Upset Period
- **Sale Date:** October 23, 2025
- **Opening Bid:** $3,400.00

### 3. Harnett County - Multiple Properties
- **Count:** 22 properties (highest count)
- **Status:** Mix of scheduled and upset period

### 4. Cherokee County - 17 Properties
- **Includes:** Residential vacant lots, acreage
- **Opening Bids:** Range from $630 to $1,190

## Technical Notes

### Scraper Performance
- **Pagination:** Successfully handled 11 pages
- **Duplicate Detection:** Stopped at page 12 when same properties detected
- **Execution Time:** ~60 seconds
- **Success Rate:** 100% (202/202 properties parsed successfully)

### Data Quality
- All 202 properties have valid parcelIds
- 68 properties have sale dates and opening bids
- 134 properties are scheduled but dates not yet set
- County names standardized (no ", NC" or " County" suffixes)

## Full Data

The complete dataset is available in `/tmp/kania_properties.json` with all property details including:
- County (standardized)
- Address
- Parcel ID
- Sale date and time
- Sale status
- Opening bid and current bid
- Upset bid deadline
- Property type
- Court file number
- Source information
