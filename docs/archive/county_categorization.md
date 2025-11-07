# NC 100 County Categorization for Scraping

## Date: November 1, 2025

---

## ✅ ALREADY COVERED (31 counties via law firms)

### Kania Law Firm (~30 counties)
Confirmed counties with active listings:
1. Alexander
2. Alleghany
3. Anson
4. Ashe

Likely additional counties served by Kania (need to verify):
- Avery, Burke, Caldwell, Catawba, Cherokee, Clay, Cleveland, Graham, Haywood, Henderson, Jackson, Lincoln, Macon, Madison, McDowell, Mitchell, Polk, Rutherford, Swain, Transylvania, Watauga, Wilkes, Yancey, and others

### RBCWB Law Firm (1 county)
5. Mecklenburg ✅

---

## 🟢 CATEGORY A: SIMPLE HTML TABLES (Priority - Easy to scrape)

These counties have straightforward HTML pages with property listings in tables:

1. **Forsyth County** ✅ VERIFIED
   - URL: https://www.forsyth.cc/tax/foreclosure_prop.aspx
   - Format: Clean HTML table with all property details
   - Status: Ready to scrape

2. **Alamance County**
   - URL: https://tax.alamancecountync.gov/home-1/tax-foreclosures/
   - Format: TBD (need to check)

3. **Brunswick County**
   - URL: https://www.brunswickcountync.gov/493/Tax-Foreclosures
   - Format: TBD

4. **Cabarrus County**
   - URL: https://www.cabarruscounty.us/Government/Departments/Tax-Administration/Tax-Collections/Foreclosures
   - Format: TBD

5. **Catawba County**
   - URL: https://catawbacountync.gov/county-services/tax/online-search/search-foreclosure-sales/
   - Format: TBD

6. **Chatham County**
   - URL: https://www.chathamcountync.gov/government/departments-programs-i-z/tax-administration/tax-foreclosure-sales
   - Format: TBD

7. **Cumberland County**
   - URL: https://www.cumberlandcountync.gov/departments/tax-group/tax/tax-foreclosure-sales
   - Format: TBD

8. **Edgecombe County**
   - URL: https://www.edgecombecountync.gov/businesses/tax_collector/tax_foreclosure_list.php
   - Format: TBD

9. **Gaston County**
   - URL: https://www.gastongov.com/668/Tax-Foreclosures
   - Format: TBD

10. **Henderson County**
    - URL: https://www.hendersoncountync.gov/tax/page/tax-foreclosure-sales
    - Format: TBD

11. **Hoke County**
    - URL: https://www.hokecounty.net/490/Foreclosure-Sales
    - Format: TBD

12. **Iredell County**
    - URL: https://www.iredellcountync.gov/485/Surplus-Property
    - Format: TBD

13. **Lincoln County**
    - URL: https://www.lincolncountync.gov/2368/Foreclosures
    - Format: TBD

14. **Moore County**
    - URL: https://www.moorecountync.gov/204/Collections
    - Format: TBD

15. **Nash County**
    - URL: https://www.nashcountync.gov/509/Nash-County-Property-for-Sale
    - Format: TBD

16. **New Hanover County**
    - URL: https://www.nhcgov.com/345/Foreclosures
    - Format: TBD

17. **Onslow County**
    - URL: https://www.onslowcountync.gov/289/Foreclosures
    - Format: TBD

18. **Orange County**
    - URL: https://www.orangecountync.gov/902/Tax-Auctions
    - Format: TBD

19. **Pitt County**
    - URL: https://www.pittcountync.gov/1163/Delinquent-Accounts-Foreclosure-Auctions
    - Format: TBD

20. **Randolph County**
    - URL: https://www.randolphcountync.gov/343/Tax-Liens
    - Format: TBD

21. **Rowan County**
    - URL: https://www.rowancountync.gov/212/Foreclosures
    - Format: TBD

22. **Rutherford County**
    - URL: https://www.rutherfordcountync.gov/departments/revenue_department_tax_administrator/foreclosure_sale_dates.php
    - Format: TBD

23. **Surry County**
    - URL: https://www.co.surry.nc.us/departments/%28k_through_z%29/tax/foreclosure_properties_list.php
    - Format: TBD

24. **Union County**
    - URL: https://www.unioncountync.gov/government/departments-r-z/taxes-property/collection-payment/property-tax-foreclosure-auction
    - Format: TBD

25. **Wilson County**
    - URL: https://www.wilsoncountync.gov/departments/tax-department/foreclosures
    - Format: TBD

26. **Yadkin County**
    - URL: https://www.yadkincountync.gov/384/Tax-Foreclosure-Sales
    - Format: TBD

27. **Cherokee County**
    - URL: https://www.cherokeecounty-nc.gov/227/Tax-Foreclosures
    - Format: TBD

28. **Halifax County**
    - URL: https://www.halifaxnc.com/205/Tax-Foreclosures
    - Format: TBD

29. **Wayne County**
    - URL: https://www.waynegov.com/784/Tax-Foreclosure-Sales
    - Format: TBD

---

## 🟡 CATEGORY B: COMPLEX DASHBOARDS/MAPS (Medium difficulty)

These counties use interactive dashboards, ArcGIS, or map-based systems:

1. **Guilford County** ❌ VERIFIED COMPLEX
   - URL: https://foreclosures.guilfordcountync.gov/
   - Format: ArcGIS Dashboard with interactive map
   - Challenge: Requires API reverse-engineering or complex Puppeteer interaction

2. **Buncombe County** ❌ VERIFIED COMPLEX
   - URL: https://www.buncombecounty.org/governing/depts/tax/tax-foreclosures.aspx
   - Format: Interactive map with property markers
   - Challenge: Must click on map markers to extract data

3. **Wake County** (Mecklenburg uses Kania)
   - URL: https://www.wake.gov/departments-government/tax-administration/real-estate/foreclosures
   - Format: Accordion/dropdown with individual parcel links
   - Challenge: Must click through individual parcels

---

## 🔴 CATEGORY C: PDF-ONLY COUNTIES (Need PDF parser)

Counties that publish foreclosure lists as PDF files:

- TBD (need to check which counties use PDFs)

---

## ❌ CATEGORY D: NO DATA / BROKEN LINKS

1. **Durham County** ❌ VERIFIED
   - URL: https://dconc.gov/i-want-to/tax-and-property-information/find-foreclosures
   - Status: 404 Page Not Found

---

## 🔍 CATEGORY E: NOT YET ASSESSED (Remaining ~40 counties)

Counties from the full NC list of 100 that don't have URLs provided yet:
- Need to research each county's tax department website
- Many small rural counties may not have online listings

---

## SCRAPING STRATEGY

### Phase 1: Quick Wins (Target: +10 counties)
Build scrapers for Category A counties with simple HTML tables.
Start with: Forsyth, Alamance, Brunswick, Cabarrus, Catawba, Chatham, Cumberland, Edgecombe, Gaston, Henderson

### Phase 2: PDF Integration (Target: +10 counties)
Enhance PDF parser and integrate PDF-based counties

### Phase 3: Complex Systems (Target: +5 counties)
Tackle complex dashboards like Guilford and Buncombe

### Phase 4: Research & Fill Gaps (Target: remaining counties)
Research unassessed counties and build custom scrapers as needed

---

## ESTIMATED FINAL COVERAGE

- **Realistic Goal**: 75-85 counties (75-85%)
- **Optimistic Goal**: 90-95 counties (90-95%)
- **100% Coverage**: Unlikely due to counties without online listings

---

## NEXT STEPS

1. ✅ Build Forsyth County scraper (verified simple HTML)
2. Check next 9 Category A counties to verify format
3. Build batch scraper for all simple HTML counties
4. Integrate into admin panel
5. Test and verify data import
