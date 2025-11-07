# County Research Notes - 100 County Expansion

## Research Session: November 1, 2025

### Brunswick County
- **URL**: https://www.brunswickcountync.gov/493/Tax-Foreclosures
- **Format**: PDF notices (individual PDFs per property)
- **Data Location**: Legal Notices page with table listing parcel numbers and sale dates
- **Complexity**: MEDIUM - Requires PDF parsing
- **Sample Data**:
  - Parcel # 214LE029 - Sale Date: December 5, 2025
  - Parcel 157FA002 & 157FA003 - Sale Date: December 5, 2025
- **PDF Content**: Legal notice with parcel ID, property description, defendants, sale date, sale location
- **Scraping Strategy**: 
  1. Scrape the Legal Notices table for parcel numbers and dates
  2. Download each PDF
  3. Parse PDF text to extract property details
  4. Alternative: Just use table data (parcel + date) without PDF parsing for initial implementation
- **Status**: Ready to build - can start with simple table scraping

---

## Next Counties to Research
- Chatham County
- Edgecombe County
- Henderson County
- Hoke County
- Moore County
- Nash County
- New Hanover County
- Onslow County
- Orange County
- Pitt County
- Randolph County
- Wilson County
- Yadkin County
- Cherokee County
- Halifax County
- Wayne County
- Iredell County

### Chatham County
- **URL**: https://www.chathamcountync.gov/government/departments-programs-i-z/tax-administration/tax-foreclosure-sales
- **Format**: Uses Zacchaeus Legal Services (ZLS)
- **Complexity**: ALREADY COVERED - ZLS scraper already researched
- **Status**: No active listings on ZLS (same as previous research)
- **Note**: Next sale scheduled November 26, 2025 - can check ZLS site periodically


### Edgecombe County ⭐ HIGH PRIORITY
- **URL**: https://www.edgecombecountync.gov/businesses/tax_collector/tax_foreclosure_list.php
- **Format**: Simple HTML table (PERFECT for scraping!)
- **Complexity**: SIMPLE - Easy HTML table scraping
- **Current Properties**: 21 properties listed
- **Sample Data**: 
  - 2256 Acorn Hill Rd, Tarboro - Parcel 4851-72-2849-00 - Hearing Continued 12/1/2025
  - SR 1225 Kingsboro Rd - Parcel 3798-45-8798-00 - Sale 11/19/2025
  - 56 Manning Road, Tarboro - Parcel 4746-77-8005-00 - Sale 11/19/2025
- **Data Fields**: Address, Township, Parcel ID, Status, File Number
- **Status**: READY TO BUILD - Top priority for Batch 1


### Henderson County
- **URL**: https://www.hendersoncountync.gov/tax/page/tax-foreclosure-sales
- **Format**: HTML table (empty currently)
- **Complexity**: SIMPLE - When properties are available
- **Current Properties**: 0 (Next sale estimated Spring 2026)
- **Data Fields**: Owner Name, Parcel #, Description, Map Link, File #, Opening Bid
- **Status**: No active listings - check back Spring 2026


### Hoke County ⭐ HIGH PRIORITY
- **URL**: https://www.hokecounty.net/487/Upcoming-Foreclosure-Sales
- **Format**: Simple HTML tables (TWO tables - upcoming sales + upset bid period)
- **Complexity**: SIMPLE - Easy HTML table scraping
- **Current Properties**: 14+ properties in upcoming sales, 2 in upset bid period
- **Sample Data**:
  - 6790 CALLOWAY RD - Parcel 584870001159 - Sale Nov 13, 2025 - $7,809.51
  - 448 BALDWIN RD - Parcel 794620001005 - POSTPONED
  - 1732 JOHN RUSSELL RD - In upset bid period, ends Oct 31, 2025 - $21,000 bid
- **Data Fields**: Parcel #, Acreage, Location, Sale Date, Time, Opening Bid, Case #, Bid amounts
- **Note**: Handled by RKS Law for Hoke County
- **Status**: READY TO BUILD - Top priority for Batch 1


### Moore County
- **URL**: https://www.moorecountync.gov/204/Collections
- **Format**: Uses Zacchaeus Legal Services (ZLS)
- **Complexity**: ALREADY COVERED - ZLS scraper already researched
- **Status**: No active listings on ZLS
- **Note**: Tax foreclosures posted 4 weeks prior to sale


### Nash County
- **URL**: https://www.nashcountync.gov/509/Nash-County-Property-for-Sale
- **Format**: Empty page (no content)
- **Complexity**: Unknown - page exists but has no listings
- **Current Properties**: 0
- **Status**: No active listings - page is empty


### New Hanover County
- **URL**: https://www.nhcgov.com/345/Foreclosures
- **Format**: Uses Kania Law Firm (ALREADY COVERED)
- **Complexity**: ALREADY COVERED via Kania scraper
- **Current Properties**: 1 property visible (4017 Masonboro Loop Rd - Sale Sept 19, 2025)
- **Note**: "Please contact Kania Law Firm, P.A. at 828-252-8010, Ext. 115 for further information"
- **Status**: Already covered by existing Kania Law Firm scraper


### Onslow County
- **URL**: https://www.onslowcountync.gov/289/Foreclosures
- **Format**: No online listing - advertised in newspaper only
- **Complexity**: NOT SCRAPABLE - newspaper ads only
- **Current Properties**: Unknown - must check Jacksonville Daily News
- **Note**: "Tax foreclosure cases are assigned to attorneys who are contracted by the county. If a case proceeds to public auction, there is no particular date that sales may be held. They are advertised in the local paper, The Jacksonville Daily News."
- **Surplus Land**: County-acquired foreclosed properties listed on Purchasing Department page
- **Status**: Cannot scrape - newspaper-only listings


### Orange County
- **URL**: https://www.orangecountync.gov/905/Current-Property-Auctions
- **Format**: Simple page with property listings (when available)
- **Complexity**: SIMPLE - but currently empty
- **Current Properties**: 0 - "There are currently no scheduled foreclosure sale dates at this time"
- **Note**: Uses In Rem foreclosure method. Sales conducted by Orange County Sheriff's Department at courthouse steps. Notices advertised in News of Orange or Chapel Hill Herald.
- **Status**: SCRAPABLE format when properties are available - currently empty


### Pitt County
- **URL**: https://www.pittcountync.gov/1165/Tax-Auction-Listings
- **Format**: Simple page with property listings (when available)
- **Complexity**: SIMPLE - but currently empty
- **Current Properties**: 0 - "There are No Tax Foreclosure & Auction Listings at This Time"
- **Note**: Sales take place on Third Street steps of Pitt County Courthouse in Greenville. Properties would be listed on this page when scheduled.
- **Status**: SCRAPABLE format when properties are available - currently empty


### Randolph County
- **URL**: https://www.randolphcountync.gov/343/Tax-Liens
- **Format**: PDF files organized alphabetically (0-9, A, B, C, etc.)
- **Complexity**: MEDIUM - PDF parsing required
- **Current Properties**: Multiple PDFs with 2025 tax liens
- **Note**: Tax liens advertised by letter groups. Would need to download and parse multiple PDF files.
- **Status**: SCRAPABLE but requires PDF parsing - medium complexity


### Wilson County
- **URL**: https://www.wilsoncountync.gov/departments/tax-department/foreclosures
- **Format**: Uses Zacchaeus Legal Services (ZLS)
- **Complexity**: ALREADY COVERED via ZLS
- **Current Properties**: Next sale date July 17, 2025
- **Note**: "Wilson County's tax foreclosures are handled through a contract with Zacchaeus Legal Services"
- **Status**: Already covered by existing ZLS research (no active listings on ZLS site)


### Yadkin County
- **URL**: https://www.yadkincountync.gov/384/Tax-Foreclosure-Sales
- **Format**: Simple HTML page with detailed property notices
- **Complexity**: SIMPLE - HTML text parsing
- **Current Properties**: 3 properties listed (Sale date: April 7, 2025)
  - Multiple Parcels 123100 127149 131352 - Opening Bid $8,796.94
  - Parcel 127149 - Opening Bid $21,668.93
  - Parcel 131352 - Opening Bid $11,189.96
- **Note**: Full legal descriptions provided. Sales at courthouse door at noon.
- **Status**: ⭐ READY TO BUILD - Simple HTML format with active properties


### Cherokee County
- **URL**: https://www.cherokeecounty-nc.gov/227/Tax-Foreclosures
- **Format**: Uses Kania Law Firm + Simple HTML table on county page
- **Complexity**: ALREADY COVERED via Kania scraper
- **Current Properties**: 4 properties listed on county page (Sale: November 6, 2025 at 11:00 AM)
  - 25CVO000263-190 - Branch, Edward - $6,300
  - 25CVO000128-190 - Good Word Ministries - $5,800
  - 24CVO000119-190 - Krot, Ann - $5,300
  - 24CVO001463-190 - Whitener, Jerry - $11,900
- **Note**: "The Kania Law Firm will handle all real property sales"
- **Status**: Already covered by existing Kania Law Firm scraper


### Halifax County
- **URL**: https://www.halifaxnc.com/205/Tax-Foreclosures
- **Format**: Document Center with foreclosure notices (when available)
- **Complexity**: SIMPLE - but currently empty
- **Current Properties**: 0 - "No records to display"
- **Note**: Sales held at Halifax County Courthouse lower lobby. Notices posted to Document Center when scheduled.
- **Status**: SCRAPABLE format when properties are available - currently empty


### Wayne County
- **URL**: https://www.waynegov.com/784/Tax-Foreclosure-Sales
- **Format**: News Flash system with individual sale notices
- **Complexity**: SIMPLE - HTML text parsing from news alerts
- **Current Properties**: 2 properties in latest sale (October 29, 2025)
  - Tract 1: 308 Creech Street, Goldsboro - Parcel 3509330677 - Opening Bid $16,010.39
  - Tract 2: 720 E. Chestnut Street, Goldsboro - Parcel 3509241354 - Opening Bid $11,144.54
- **Note**: Regular monthly sales. Each sale posted as separate news flash. Multiple historical sales visible.
- **Status**: ⭐ READY TO BUILD - Simple HTML format with active properties



## Batch 2 Research Summary (10 counties)

### Ready to Build - Simple Format
1. ⭐ **Wayne County** - 3+ properties (News Flash format) - **SCRAPER BUILT** ✅

### Requires Puppeteer (JavaScript rendering)
2. **Yadkin County** - 3 properties (Legal notice format, dynamic content)

### Already Covered by Existing Scrapers
3. New Hanover County - Uses Kania Law Firm
4. Cherokee County - Uses Kania Law Firm
5. Chatham County - Uses ZLS
6. Wilson County - Uses ZLS

### Empty but Scrapable
7. Orange County - Simple format, no current properties
8. Pitt County - Simple format, no current properties
9. Halifax County - Document center, no current properties

### Not Scrapable
10. Onslow County - Newspaper ads only (Jacksonville Daily News)

### Medium Complexity (PDF)
11. Brunswick County - PDF format (2 properties)
12. Randolph County - PDF format

**Batch 2 Result:** 1 new scraper built (Wayne County), 4 counties already covered, 1 requires Puppeteer


## Batch 3 Research: Smallest Counties (Pop. 3,517 - 16,580)

### 1. Tyrrell County (Pop. 3,517) - Smallest in NC
- **URL**: http://tyrrellcounty.org/en/foreclosures
- **Format**: Empty page
- **Status**: ❌ No active foreclosure listings
- **Notes**: Page exists but contains no content


### 2. Hyde County (Pop. 4,583)
- **URL**: https://www.hydecountync.gov/newsdetail_T73_R2471.php
- **Format**: News posts (individual notices)
- **Status**: ❌ No current listings (last post July 2020)
- **Notes**: County posts individual foreclosure notices as news items, but none recent


### 3. Graham County (Pop. 8,179)
- **URL**: https://www.grahamcounty.org/tax_collector.html
- **Format**: Contact tax collector for information
- **Status**: ❌ No online listings (call 828-479-7962)
- **Notes**: Must contact office directly

### 4. Jones County (Pop. 9,462)
- **URL**: Facebook post (August 25, 2025 sale)
- **Format**: Individual Facebook posts
- **Status**: ⚠️ Sporadic postings on social media
- **Notes**: Not a reliable scrapable source

### 5. Gates County (Pop. 10,299)
- **Status**: ⏳ To research

### 6. Washington County (Pop. 10,654)
- **Status**: ⏳ To research

### 7. Camden County (Pop. 11,184)
- **Status**: ⏳ To research

### 8. Alleghany County (Pop. 11,379)
- **Status**: ✅ Uses Kania Law Firm (already covered)

### 9. Clay County (Pop. 12,042)
- **URL**: https://tax.claync.us/foreclosures
- **Format**: Uses Kania Law Firm
- **Status**: ✅ Already covered by Kania scraper
- **Notes**: Page directs to Kania Law Firm (828-252-8010)

### 10-15. Remaining small counties
- Pamlico County (12,550)
- Perquimans County (13,460)
- Chowan County (13,891)
- Swain County (13,945)
- Mitchell County (15,030)
- Northampton County (16,580)


### 5. Gates County (Pop. 10,299)
- **URL**: Uses Zacchaeus Legal Services
- **Format**: ZLS (Facebook posts for sales)
- **Status**: ✅ Already covered by ZLS research
- **Notes**: Facebook post shows August 2023 sale

### 6. Washington County (Pop. 10,654)
- **URL**: https://washconc.org/tax-office/
- **Format**: No online listings (contact Delinquent Tax Coordinator)
- **Status**: ❌ No online foreclosure listings
- **Notes**: Tax liens advertised in April, but no public listing page

### 7. Camden County (Pop. 11,184)
- **Status**: ⏳ To research (no foreclosure page found in search)

### 11. Pamlico County (Pop. 12,550)
- **URL**: https://pamlicocounty.org/departments/tax/index.php
- **Format**: No online listings (contact Clerk of Court)
- **Status**: ❌ No online foreclosure listings
- **Notes**: Register of Deeds records deeds after foreclosure, but no public listing

### 12. Perquimans County (Pop. 13,460)
- **URL**: https://www.perquimanscountync.gov/tax-administrator
- **Format**: Individual PDF notices posted for each sale
- **Status**: ⚠️ Medium complexity (PDF parsing required)
- **Notes**: Multiple notices from 2023-2025, actively posts foreclosures
- **Example**: October 2024 sale - 3 properties with opening bids

### 13. Swain County (Pop. 13,945)
- **Status**: ⏳ To research

### 14. Mitchell County (Pop. 15,030)
- **Status**: ⏳ To research


### 7. Camden County (Pop. 11,184)
- **URL**: https://www.camdencountync.gov/279/Taxes
- **Format**: No online foreclosure listings
- **Status**: ❌ No online listings
- **Notes**: Tax page has no foreclosure section

### 13. Swain County (Pop. 13,945)
- **URL**: https://www.swaincountync.gov/tax-office/
- **Format**: No online foreclosure listings
- **Status**: ❌ No online listings
- **Notes**: General tax information only

### 14. Mitchell County (Pop. 15,030)
- **URL**: https://www.mitchellcountync.gov/departments/tax-collector/
- **Format**: Newspaper advertisements (The Mitchell News)
- **Status**: ❌ No online listings (newspaper only)
- **Notes**: Advertises in local newspaper in March, some sales via Bid4Assets

## Batch 3 Summary (15 Smallest Counties: Pop. 3,517 - 16,580)

**Results:**
- ✅ Already Covered: 5 counties (Kania x2, ZLS x3)
- ❌ No Online Listings: 8 counties
- ⚠️ PDF Format (Medium Complexity): 1 county (Perquimans)
- **New Scrapers Built: 0**
- **Counties Added to Coverage: 5** (via existing law firm scrapers)

**Conclusion:** Smallest counties have very low yield for new scrapers. Most use law firms already covered or don't publish online.


## Batch 4 Research: Small-Medium Counties (Pop. 17,811 - 32,278)

### 1. Currituck County (Pop. 32,278)
- **URL**: https://currituckcountync.gov/tax/tax-foreclosures/
- **Format**: Simple HTML page with foreclosure list
- **Status**: ✅ Scrapable format, currently NO foreclosures scheduled
- **Notes**: Clear format, would be easy to scrape when properties are listed

### 2. Cherokee County (Pop. 30,373)
- **Status**: ✅ Already covered (Kania Law Firm)

### 3. Ashe County (Pop. 27,266)
- **URL**: https://www.ashecountygov.com/departments/tax-administration/pending-tax-foreclosures
- **Format**: Uses Kania Law Firm
- **Status**: ✅ Already covered (Kania Law Firm)
- **Notes**: Page explicitly states "For additional information contact KANIA LAW FIRM"


### 4. Anson County (Pop. 22,432)
- **URL**: https://www.co.anson.nc.us/departments/tax/tax-foreclosure-auction (404 error)
- **Format**: Uses Kania Law Firm + Bid4Assets
- **Status**: ✅ Already covered (Kania Law Firm)
- **Notes**: Facebook post mentions "The Kania Law Firm of Asheville, NC will be conducting the auction"

### 5. Madison County (Pop. 22,352)
- **URL**: https://www.madisoncountync.gov/tax-foreclosure-sale.html
- **Format**: General information page only
- **Status**: ❌ No property listings (information page only)
- **Notes**: Has detailed process information but no actual property listings

### Remaining Batch 4 Counties (11 counties to research)
- Bladen County (29,777)
- Montgomery County (26,364)
- Caswell County (22,363)
- Martin County (21,523)
- Greene County (20,671)
- Polk County (20,320)
- Hertford County (19,169)
- Warren County (19,081)
- Yancey County (18,993)
- Avery County (17,811)
- Bertie County (16,939)
