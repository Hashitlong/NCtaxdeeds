# NC Tax Deed Scraper - 100 County Status Report

**Last Updated:** November 1, 2025 (Evening Update)
**Current Coverage:** 43 counties (43%)  
**Working Scrapers:** 14 (added Cumberland + McDowell today)
**Counties Researched:** 54 of 100

---

## Executive Summary

**Coverage Breakdown:**
- ✅ **Active Scrapers Built:** 14 counties (14%)
- ✅ **Covered by Law Firms:** 29 counties (29%) - Kania, ZLS, RBCWB
- ❌ **No Online Listings:** 20 counties (20%)
- ⚠️ **Scrapable but Empty:** 8 counties (8%)
- ⏳ **Not Yet Researched:** 46 counties (46%)

**Key Findings:**
1. **Kania Law Firm** covers ~30 counties (largest single source)
2. **Small counties** (pop. <20K) rarely have online foreclosure data
3. **Medium-large counties** (pop. 60K+) more likely to have active listings
4. **PDF formats** are common for smaller counties
5. **Today's additions:** Cumberland County (2 properties), McDowell County (3 properties)

---

## Detailed County Status

### ✅ ACTIVE SCRAPERS (14 counties)

**Built and Integrated:**
1. **Alamance County** - Custom HTML table scraper
2. **Anson County** - Custom PDF scraper (4 properties)
3. **Bladen County** - Custom PDF scraper (13 properties)
4. **Cabarrus County** - Custom HTML table scraper (41 properties)
5. **Catawba County** - Custom HTML table scraper (1 property)
6. **Cumberland County** - Custom HTML table scraper (2 properties) ✨ NEW
7. **Edgecombe County** - Custom HTML table scraper (21 properties)
8. **Forsyth County** - Custom HTML table scraper (25 properties)
9. **Gaston County** - Custom HTML table scraper (2 properties)
10. **Hoke County** - Custom HTML table scraper (16 properties)
11. **McDowell County** - Custom HTML table scraper (3 properties) ✨ NEW
12. **Mecklenburg County** - RBCWB Law Firm scraper (26 properties)
13. **Rutherford County** - Custom HTML table scraper (11 properties)
14. **Wayne County** - Custom news flash scraper (3 properties)
15. **Yadkin County** - Custom HTML table scraper (3 properties)

**Plus Law Firm Multi-County Coverage:**
- **Kania Law Firm** - ~30 counties (20 active properties across 4 counties)
- **ZLS** - 30 counties (160 active properties)
- **RBCWB** - Mecklenburg County

---

### ✅ COVERED BY EXISTING LAW FIRM SCRAPERS (29 counties)

**Kania Law Firm (~30 counties):**
- Alexander, Alleghany, Ashe, Avery, Buncombe, Burke, Caldwell, Cherokee, Clay, Cleveland, Davidson, Davie, Graham, Haywood, Henderson, Jackson, Lincoln, Madison, Mitchell, New Hanover, Polk, Rowan, Surry, Swain, Transylvania, Watauga, Wilkes, Yancey

**RBCWB Law Firm (1 county):**
- Mecklenburg County

**Zacchaeus Legal Services - ZLS (30 counties):**
- Beaufort, Bertie, Camden, Carteret, Caswell, Chatham, Chowan, Columbus, Craven, Currituck, Dare, Duplin, Gates, Granville, Greene, Halifax, Harnett, Hertford, Hyde, Jones, Lee, Lenoir, Martin, Moore, Northampton, Pamlico, Pasquotank, Perquimans, Tyrrell, Washington, Wilson

---

### ❌ NO ONLINE LISTINGS (20 counties researched)

**Counties with No Active Foreclosures:**
1. **Durham County** (343K) - 0 active (1 sold property)
2. **Johnston County** (250K) - "No Sale Scheduled At This Time"
3. **Carteret County** (70K) - Empty table
4. **Henderson County** (120K) - Empty table
5. **Iredell County** (206K) - Clerk of Court only
6. **Watauga County** (56K) - No online foreclosure system
7. **Haywood County** (63K) - Uses Bid4Assets platform
8. **Randolph County** (145K) - Uses Bid4Assets + ArcGIS
9. **Brunswick County** - No dedicated foreclosure page
10. **Pender County** - Uses GovDeals for surplus property
11. **Buncombe County** (279K) - PDF with outdated data (2022)

**Smallest Counties (Pop. <20K):**
12. **Tyrrell County** (3,517) - Empty page
13. **Hyde County** (4,583) - Last listing 2020
14. **Graham County** (8,179) - Call only
15. **Jones County** (9,462) - Sporadic Facebook posts
16. **Washington County** (10,654) - Contact office
17. **Camden County** (11,184) - No foreclosure page
18. **Pamlico County** (12,550) - Contact Clerk of Court
19. **Swain County** (13,945) - No online listings
20. **Mitchell County** (15,030) - Newspaper ads only

**Empty but Scrapable Format:**
- **Orange County** - Simple format, no current properties
- **Pitt County** - Simple format, no current properties
- **Nash County** - Empty page

---

### ⏳ NOT YET RESEARCHED (46 counties)

**Large Counties (Pop. 100K+):**
- Guilford (559K), Union (263K), New Hanover (243K - partial), Onslow (213K - partial)

**Medium Counties (Pop. 50K-100K):**
- Franklin, Harnett, Iredell (partial), Lee, Lenoir, Robeson, Rockingham, Sampson, Scotland, Stanly, Stokes, Vance, Wake (1.23M)

**Small Counties (Pop. 20K-50K):**
- Beaufort, Bertie, Caswell, Cleveland, Columbus, Craven, Dare, Duplin, Granville, Montgomery, Pasquotank, Person, Perquimans, Richmond

**Smallest Counties (Pop. <20K):**
- (Most already researched in Batch 3)

---

## Research Progress by Batch

### Today's Session (13 counties researched)
- **Durham, Cumberland, Buncombe, Johnston, Iredell** (priority counties)
- **New Hanover, Brunswick, Carteret, Pender** (coastal counties)
- **Henderson, Haywood, Watauga, McDowell** (mountain counties)
- **Result:** 2 new scrapers built (Cumberland, McDowell) - 5 properties added
- **Already Covered:** 3 counties (Kania)
- **No Online Data:** 8 counties

### Previous Batches (41 counties researched)
- **Result:** 12 scrapers built
- **Already Covered:** 29 counties via law firms
- **Empty/No Data:** 12 counties

---

## Estimated Final Coverage

**Realistic Projections:**
- **Current:** 43 counties (43%)
- **After completing all research:** 60-70 counties (60-70%)
- **Maximum achievable:** 75-80 counties (75-80%)

**Why not 100%:**
- ~20 counties have no online foreclosure systems
- ~10 counties use non-scrapable platforms (Bid4Assets, ArcGIS)
- ~10 counties have zero foreclosure activity

**Expected New Scrapers:**
- **Simple HTML:** 10-15 counties (based on patterns)
- **PDF Format:** 3-5 counties
- **Total New Possible:** 13-20 scrapers

---

## Next Steps

### Immediate (Next Session)
1. Research next batch of 10-15 counties (Guilford, Union, Wake, Franklin, etc.)
2. Build scrapers for any with simple HTML formats
3. Continue systematic coverage expansion

### Short-Term (2-3 Sessions)
- Reach 50-55 counties (50-55% coverage)
- Focus on medium/large counties for higher property counts

### Long-Term (5-10 Sessions)
- Reach 65-70 counties (65-70% coverage)
- Build PDF parsers for remaining viable counties
- Document all non-scrapable counties

---

## County Coverage Map

**By Region:**
- **Western NC (Mountains):** Strong coverage via Kania Law Firm
- **Eastern NC (Coastal):** Strong coverage via ZLS
- **Central NC (Piedmont):** Mixed - some custom scrapers, some gaps
- **Urban Counties:** Most covered (Mecklenburg, Forsyth, Cabarrus, Wake via law firms)

**Gaps to Fill:**
- Mid-sized Piedmont counties (Guilford, Union, Rockingham, Vance)
- Some coastal counties (New Hanover researched but via Kania)
- Rural counties without law firm coverage
