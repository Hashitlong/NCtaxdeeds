# NC County Expansion - Final Summary
## November 1, 2025

## Overview

Completed comprehensive research of 9 high-priority NC counties (Durham, Cumberland, Buncombe, Johnston, Iredell, New Hanover, Brunswick, Carteret, Pender) plus 4 mountain counties (Henderson, Haywood, Watauga, McDowell).

**Result**: Built **2 new county scrapers** (Cumberland + McDowell), adding **5 properties** to the database.

## New Scrapers Built

### 1. Cumberland County ✓
- **Population**: 338,000 (6th largest in NC)
- **Properties Found**: 2 active foreclosures
- **Format**: Simple HTML table
- **URL**: https://www.cumberlandcountync.gov/departments/tax-group/tax/tax-foreclosure-sales
- **Status**: Fully integrated and tested
- **Properties**:
  1. Ratiff, Jackie T - IMP 229 W Jenkins - Parcel 0426929143000 - Sale: Oct 30, 2025
  2. Zelm, LLC - Arran Hills - Parcel 0406067341000 - Sale: Nov 20, 2025

### 2. McDowell County ✓
- **Population**: 45,000 (Mountain region)
- **Properties Found**: 3 active foreclosures
- **Format**: HTML table with upset bid tracking
- **URL**: https://www.mcdowellgov.com/departments/tax-collections/tax-foreclosures/upcoming-tax-foreclosure-sales
- **Status**: Fully integrated and tested
- **Properties**:
  1. Parcel 0731-00-21-9654 - $14,250 bid - Upset ends: Nov 10, 2025
  2. Parcel 1712-18-20-5044 - $50,000 bid - Upset ends: Nov 10, 2025
  3. Parcel 1701-10-26-6613 - $8,250 bid - Upset ends: Nov 3, 2025

## Research Findings

### Counties Already Covered by Law Firms
Most medium/large counties are already covered by existing law firm scrapers:

**Kania Law Firm** covers:
- New Hanover (coastal)
- Rowan (medium-sized)
- Davidson (medium-sized)
- Plus 30+ other counties (4 currently have active properties)

**ZLS (Zacchaeus Legal Services)** covers:
- 30 counties with 160 active properties
- Includes most coastal counties (Dare, Craven, Onslow, Pender, etc.)

**Hutchens Law Firm** covers:
- Union County
- Currently 0 active properties

### Counties with No Active Listings
- **Durham**: 0 active (1 sold) - wealthy county, low delinquency
- **Johnston**: "No Sale Scheduled At This Time"
- **Carteret**: Empty table (coastal county)
- **Henderson**: Empty table (mountain county)

### Counties with Non-Scrapable Systems
- **Iredell**: Clerk of Court only (no online system)
- **Haywood**: Uses Bid4Assets platform
- **Randolph**: Uses Bid4Assets + ArcGIS
- **Watauga**: No online foreclosure system
- **Brunswick**: No dedicated foreclosure page
- **Pender**: Uses GovDeals for surplus property

### Counties with Outdated Data
- **Buncombe**: PDF with 4 properties but dates from 2022

## Current Coverage Status

**Total Counties**: 43 out of 100 (43%)
- Added Cumberland County
- Added McDowell County

**Total Active Properties**: ~361
- Cumberland: 2 properties
- McDowell: 3 properties
- Previous: ~356 properties

## Key Insights

### 1. Law Firms Dominate Coverage
The majority of NC counties outsource tax foreclosures to law firms:
- **ZLS**: 30 counties, 160 properties
- **Kania**: 30+ counties, 20 properties (4 counties active)
- **Hutchens**: Multiple counties, 0 current properties
- **RBCWB**: Mecklenburg County, 26 properties

This means most medium/large counties are already covered.

### 2. Many Counties Have Zero Foreclosures
Several counties have foreclosure systems but no current sales:
- Durham (wealthy)
- Johnston (suburban growth)
- Carteret (coastal, seasonal)
- Henderson (mountain resort)

This is normal - not all counties have constant foreclosure activity.

### 3. Small Counties Lack Online Systems
Many small/rural counties don't publish foreclosures online:
- Iredell, Watauga, Brunswick, Pender
- Sales handled by Clerk of Court in person
- Not feasible to scrape

### 4. External Platforms Are Common
Several counties use third-party auction platforms:
- Bid4Assets (Haywood, Randolph, Henderson)
- GovDeals (Pender)
- Auction.com (various)

These platforms are harder to scrape and may require separate integration.

## Recommendations for Future Expansion

### Short-Term (Reach 50 counties)
1. **Research small/rural counties** (20K-50K population)
   - Less likely to use law firms
   - May have simple HTML formats
   - Target: Granville, Person, Caswell, Halifax, Nash, Sampson, Duplin

2. **Monitor empty counties monthly**
   - Henderson, Carteret, Johnston
   - These have good table formats, just need properties

3. **Check law firm coverage**
   - Verify which counties each law firm actually handles
   - Some law firms claim 30+ counties but only have 4 active

### Medium-Term (Reach 60-70 counties)
1. **Build PDF parsers**
   - Buncombe County (if PDF is updated)
   - Look for other counties with PDF formats
   - Similar to Anson/Bladen scrapers

2. **Research regional partnerships**
   - Some counties share services
   - Regional foreclosure cooperatives

3. **Coastal county deep dive**
   - Many coastal counties have high foreclosure rates
   - Check smaller coastal counties (Currituck, Camden, Pasquotank)

### Long-Term (Reach 80+ counties)
1. **External platform integration**
   - Bid4Assets API (if available)
   - GovDeals integration
   - Could add 10-15 counties

2. **Manual data entry for critical counties**
   - High-value counties without online systems
   - Quarterly updates for Iredell, Watauga, etc.

3. **Statewide monitoring**
   - Quarterly checks of all 100 counties
   - Update coverage as systems change

## Technical Notes

### McDowell Scraper Challenges
- Table doesn't include address or owner names
- Only parcel numbers and bid amounts
- Used parcel number as address placeholder
- Users can lookup details via county GIS

### Cumberland Scraper
- Clean table format with all data
- Similar to Edgecombe and Hoke scrapers
- Straightforward implementation

### Integration
- Both scrapers added to ScraperService
- Admin UI updated with new county cards
- tRPC router updated with new enum values
- All tests passing

## Conclusion

**Expansion Progress**: 42 → 43 counties (43% coverage)

**Key Finding**: Most medium/large NC counties are already covered by law firm scrapers (Kania, ZLS, Hutchens). Future expansion should focus on:
1. Small/rural counties (20K-50K population)
2. Counties with simple HTML formats
3. Regional partnerships and cooperatives

**Next Steps**:
1. Research small counties (Granville, Person, Caswell, Halifax, Nash)
2. Monitor empty counties monthly (Henderson, Carteret, Johnston)
3. Build PDF parsers for counties like Buncombe

**Realistic Goal**: 60-70 counties (60-70% coverage) is achievable. 100% coverage is unlikely due to:
- Counties with no online systems
- Counties using non-scrapable platforms
- Counties with zero foreclosure activity
