# Medium-Sized Counties Research - November 1, 2025

## Summary

Researched 4 medium-sized NC counties (Union, Randolph, Rowan, Davidson) and discovered that **3 out of 4 are already covered** by existing law firm scrapers! Also discovered that **ZLS covers 30 counties** with 160 active properties.

## County Research Results

### 1. Union County (248K population)
- **Status**: Covered by Hutchens Law Firm ✓
- **Current Properties**: 0 (Hutchens currently has no active listings)
- **Notes**: Search results showed Hutchens handles Union County foreclosures
- **Action**: Already integrated - no new scraper needed

### 2. Randolph County (145K population)
- **Status**: Uses Bid4Assets + ArcGIS Story Map
- **Format**: Complex JavaScript-based auction platform
- **Recommendation**: SKIP - not easily scrapable
- **Notes**: 7 properties listed on Bid4Assets (live auction platform)

### 3. Rowan County (146K population)
- **Status**: Covered by Kania Law Firm ✓
- **Current Properties**: 0 (Kania currently has no Rowan properties)
- **Notes**: County website explicitly redirects to Kania for foreclosure listings
- **Action**: Already integrated - no new scraper needed

### 4. Davidson County (168K population)
- **Status**: Covered by Kania Law Firm ✓
- **Current Properties**: 0 (Kania currently has no Davidson properties)
- **Notes**: County website shows Kania handles their foreclosures
- **Action**: Already integrated - no new scraper needed

## Law Firm Coverage Analysis

### Current Active Coverage

**Kania Law Firm**
- Counties with active properties: 4 (Alexander, Alleghany, Anson, Ashe)
- Total properties: 20
- Note: Claims to handle 30+ counties but most have no active foreclosures

**Hutchens Law Firm**
- Counties with active properties: 0
- Total properties: 0
- Note: Website is functional but currently empty

**ZLS (Zacchaeus Legal Services)** ⭐
- Counties with active properties: 30
- Total properties: 160
- Counties covered:
  * Beaufort
  * Cabarrus (already have direct scraper)
  * Catawba (already have direct scraper)
  * Chatham
  * Chowan
  * City of Laurinburg
  * City of Lumberton
  * Craven
  * Dare
  * Forsyth (already have direct scraper)
  * Franklin
  * Gates
  * Guilford
  * Iredell
  * Jones
  * Lenoir
  * Moore
  * Northampton
  * Onslow
  * Pamlico
  * Perquimans
  * Richmond
  * Robeson
  * Scotland
  * Town of Maxton
  * Town of Williamston
  * Warren
  * Washington
  * Wilson
  * Yadkin (already have direct scraper)

**RBCWB Law Firm**
- Counties with active properties: 1 (Mecklenburg)
- Total properties: 26

## Key Findings

### 1. ZLS is a Goldmine
ZLS covers **30 counties** with **160 active properties**. Many of these are likely NEW counties not in our database:
- Beaufort, Chatham, Chowan, Craven, Dare, Franklin, Gates, Guilford, Iredell, Jones, Lenoir, Moore, Northampton, Onslow, Pamlico, Perquimans, Richmond, Robeson, Scotland, Warren, Washington, Wilson
- Plus municipalities: City of Laurinburg, City of Lumberton, Town of Maxton, Town of Williamston

### 2. Law Firms Handle Multiple Counties
Many counties outsource foreclosure management to law firms rather than maintaining their own systems. This means:
- Building law firm scrapers is more efficient than county-by-county
- We already have good law firm coverage (Kania, Hutchens, ZLS, RBCWB)
- Need to run "scrape all" to populate database with ZLS counties

### 3. Many Counties Have Zero Active Foreclosures
Even large counties like:
- Durham (343K) - only 1 sold property
- Rowan (146K) - 0 active
- Davidson (168K) - 0 active
- Union (248K) - 0 active

This suggests:
- Economic conditions vary significantly by county
- Not all 100 counties will have active foreclosures at any given time
- Focus should be on coverage breadth, not just population size

## Immediate Actions

### 1. Run "Scrape All" to Populate ZLS Counties
The ZLS scraper is already integrated but we need to run it to populate the database with all 30 counties.

**Expected Result**: Add ~15-20 NEW counties from ZLS

### 2. Verify New County Count
After running ZLS scraper, check database to confirm new county additions.

### 3. Update Coverage Statistics
Current: 42 counties
After ZLS import: Estimated 57-62 counties (57-62% coverage)

## Next Research Targets

Since medium-sized counties are mostly covered by existing law firms, focus on:

### 1. Coastal/Tourist Counties
- New Hanover (Wilmington - 234K)
- Brunswick (142K)
- Carteret (70K)
- Pender (63K)

### 2. Mountain Counties
- Henderson (120K)
- Haywood (63K)
- McDowell (45K)

### 3. Small Counties Not Covered by Law Firms
- Check counties with 20K-50K population
- Look for simple HTML table formats like Cumberland, Edgecombe, Hoke

## Conclusion

**Major Discovery**: ZLS already covers 30 counties with 160 properties! Running the existing ZLS scraper will likely add 15-20 NEW counties to our database, bringing us from 42 counties (42%) to approximately 57-62 counties (57-62% coverage).

**Recommendation**: Run "scrape all" immediately to populate ZLS data, then reassess coverage gaps.
