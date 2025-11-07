# NC TAX DEED PROPERTY TRACKER - COUNTY COVERAGE MASTER LIST
**Last Updated**: November 1, 2025

## Coverage Summary
- **Total NC Counties**: 100
- **Currently Covered**: 41 counties (41%)
- **Built & Working**: 12 custom scrapers
- **Law Firm Coverage**: ~20-25 counties via Kania Law Firm + ZLS
- **Remaining to Research**: 59 counties (59%)
- **Automation Status**: ✅ Daily automated scraping at 2 AM (all 12 scrapers)

---

## ✅ COVERED COUNTIES (41 counties)

### Via Kania Law Firm (~10-15 counties confirmed)
1. Alleghany County ✅
2. Ashe County ✅
3. Cherokee County ✅
4. Clay County ✅
5. New Hanover County ✅
6. Plus ~5-10 more counties (see Kania website for complete list)

### Via ZLS (Zacchaeus Legal Services) (~6 counties confirmed)
1. Chatham County ✅
2. Chowan County ✅
3. Gates County ✅
4. Moore County ✅
5. Northampton County ✅
6. Wilson County ✅

### Via Custom Scrapers (12 scrapers, covering 12+ counties)
1. **Kania Law Firm** - Multi-county scraper ✅
2. **RBCWB Law Firm** - Multi-county scraper ✅
3. **ZLS** - Multi-county scraper ✅
4. **Forsyth County** - Custom scraper ✅
5. **Gaston County** - Custom scraper ✅
6. **Alamance County** - Custom scraper ✅
7. **Catawba County** - Custom scraper ✅
8. **Cabarrus County** - Custom scraper ✅
9. **Rutherford County** - Custom scraper ✅
10. **Edgecombe County** - Custom scraper ✅ (21 properties)
11. **Hoke County** - Custom scraper ✅ (16 properties)
12. **Wayne County** - Custom scraper ✅ (3+ properties)

---

## 📋 RESEARCH COMPLETED - NO SCRAPER NEEDED

### Already Covered by Law Firms (11 counties)
- Alleghany County - Kania
- Ashe County - Kania
- Chatham County - ZLS
- Cherokee County - Kania
- Chowan County - ZLS
- Clay County - Kania
- Gates County - ZLS
- Moore County - ZLS
- New Hanover County - Kania
- Northampton County - ZLS
- Wilson County - ZLS

### No Online Listings (14 counties)
- Burke County - Call Clerk of Court only
- Camden County - No foreclosure page
- Graham County - Call only
- Henderson County - Empty until Spring 2026
- Hyde County - Last listing 2020
- Jones County - Sporadic Facebook posts
- Mitchell County - Newspaper ads only
- Nash County - Empty page
- Onslow County - Newspaper ads only
- Pamlico County - Contact Clerk of Court
- Swain County - No online listings
- Tyrrell County - Empty page
- Washington County - Contact office only

### Empty But Scrapable Format (3 counties)
- Currituck County - Simple format, currently no foreclosures
- Orange County - Simple format, no current properties
- Pitt County - Simple format, no current properties
- Halifax County - Document center, no current properties

---

## 🔨 IDENTIFIED FOR FUTURE SCRAPER DEVELOPMENT

### Medium Complexity - PDF Parsing Required (4 counties)
1. **Brunswick County** - PDF format (2 properties)
2. **Perquimans County** - Individual PDF notices (3+ properties)
3. **Randolph County** - PDF format
4. **Yadkin County** - Requires Puppeteer (3 properties)

### Potential Simple Format - Needs Verification (6 counties)
1. **Anson County** - Tax foreclosure auction page found
2. **Bladen County** - County-owned property for sale
3. **Greene County** - County owned properties for sale
4. **Hertford County** - County owned foreclosure properties
5. **Madison County** - Tax foreclosure sale page
6. **Warren County** - Tax foreclosure notices

---

## ❓ NOT YET RESEARCHED (~46 counties)

### Batch 4 Remaining (10 counties, Pop. 17,811-26,364)
- Avery County (17,811)
- Bertie County (16,939)
- Caswell County (22,363)
- Madison County (22,352) - *Has foreclosure page, needs verification*
- Martin County (21,523)
- Montgomery County (26,364)
- Polk County (20,320)
- Yancey County (18,993)

### Batch 5+ Remaining (~38 counties, Pop. 30,000+)
Medium to large counties still needing research:
- Beaufort County (44,576)
- Bladen County (29,777)
- Buncombe County (279,210) - *Complex format*
- Carteret County (70,259)
- Cleveland County (102,194)
- Columbus County (50,054)
- Craven County (104,167)
- Cumberland County (338,430)
- Currituck County (32,278) - *Researched, empty*
- Dare County (38,183)
- Duplin County (50,539)
- Durham County (343,628)
- Franklin County (79,771)
- Granville County (61,544)
- Guilford County (558,816) - *Complex format*
- Harnett County (146,096)
- Haywood County (63,048)
- Iredell County (206,361)
- Jackson County (45,281)
- Johnston County (249,794)
- Lee County (68,537)
- Lenoir County (55,332)
- Macon County (38,717)
- McDowell County (45,269)
- Pasquotank County (41,418)
- Pender County (70,077)
- Person County (40,143)
- Richmond County (41,990)
- Robeson County (118,624)
- Rockingham County (93,517)
- Sampson County (60,404)
- Scotland County (33,898)
- Stanly County (67,326)
- Stokes County (45,857)
- Transylvania County (34,103)
- Union County (263,386)
- Vance County (42,337)
- Wake County (1,232,444) - *Complex format*
- Watauga County (54,997)
- Wilkes County (66,186)

---

## 📊 RESEARCH INSIGHTS

### Patterns Observed

**Small Counties (<20,000 pop):**
- 53% use law firms (Kania, ZLS)
- 47% have no online listings
- 0% have unique scrapable formats
- **Conclusion:** Very low yield for new scrapers

**Small-Medium Counties (20,000-50,000 pop):**
- 30% use law firms
- 30% have no online listings  
- 20% have empty but scrapable formats
- 20% have active scrapable data
- **Conclusion:** Better yield, worth researching

**Medium-Large Counties (50,000+ pop):**
- More likely to have online data
- Mix of simple and complex formats
- Higher property counts
- **Conclusion:** High priority for coverage

### Scraper Complexity Levels

**Simple (30-45 min development):**
- HTML tables (Edgecombe, Hoke, Wayne)
- Clear structured data
- No JavaScript rendering needed

**Medium (1-2 hours development):**
- PDF parsing (Brunswick, Perquimans, Randolph)
- JavaScript-rendered pages (Yadkin)
- Requires additional libraries

**Complex (3+ hours development):**
- Interactive maps (Buncombe)
- ArcGIS dashboards (Guilford)
- Individual parcel clicks (Wake)
- PowerPoint presentations (Union)

---

## 🎯 RECOMMENDED NEXT STEPS

### Phase 1: Quick Wins (Est. 2-3 hours)
1. Verify and build scrapers for 6 identified counties:
   - Anson, Bladen, Greene, Hertford, Madison, Warren
2. Expected yield: 3-5 new working scrapers

### Phase 2: Complete Batch 4 (Est. 3-4 hours)
1. Research remaining 10 small-medium counties
2. Build scrapers for any with simple formats
3. Expected yield: 2-3 new scrapers

### Phase 3: Medium-Large Counties (Est. 10-15 hours)
1. Research 38 remaining medium-large counties
2. Build scrapers for simple formats
3. Expected yield: 10-15 new scrapers

### Phase 4: PDF & Complex Formats (Est. 5-10 hours)
1. Build PDF scrapers (Brunswick, Perquimans, Randolph)
2. Build Puppeteer scraper (Yadkin)
3. Tackle complex formats (Buncombe, Guilford, Wake)
4. Expected yield: 5-7 new scrapers

### Total Estimated Coverage: 60-70 counties
**Realistic final coverage:** 60-70% of NC counties with active scrapable data

---

## 📁 RELATED DOCUMENTATION

- `EXPANSION_PROGRESS_SUMMARY.md` - Detailed expansion progress report
- `COUNTY_RESEARCH_NOTES.md` - Detailed research findings for each county
- `BATCH3_SMALLEST_COUNTIES.md` - List of 15 smallest counties researched
- `BATCH4_SMALL_MEDIUM_COUNTIES.md` - List of next 16 counties to research
- `AUTOMATION_SETUP.md` - Daily automation configuration
- `userGuide.md` - User-facing documentation

---

*This document is the single source of truth for county coverage status. Update after each research session or scraper deployment.*
