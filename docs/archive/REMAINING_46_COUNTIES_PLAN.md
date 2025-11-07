# Systematic Plan: Research Remaining 46 Counties

**Goal:** Achieve 60-70% coverage (60-70 counties) by researching all remaining counties
**Current:** 43/100 counties (43%)
**Target:** 65-70/100 counties (65-70%)
**Remaining:** 46 counties to research

---

## Research Strategy

### Priority Order
1. **Large counties first** (pop. 100K+) - Higher foreclosure volume
2. **Medium counties** (pop. 50K-100K) - Moderate volume
3. **Small counties** (pop. 20K-50K) - Lower volume but still viable
4. **Skip tiny counties** (pop. <20K) - Most already researched, rarely have online data

### Research Process (Per County)
1. Visit county tax/foreclosure website
2. Categorize format: Simple HTML / PDF / Complex / None
3. Count active properties (if any)
4. Document URL and notes
5. Mark as: Build Scraper / Already Covered / No Data / Too Complex

---

## Batch 5: Large Counties (4 counties, pop. 100K+)

**Priority: HIGHEST - Most likely to have active foreclosures**

1. **Guilford County** (559K) - Greensboro/High Point
   - URL: https://www.guilfordcountync.gov/our-county/tax/foreclosure-sales
   - Expected: Complex (ArcGIS?) or law firm

2. **Union County** (263K) - Monroe (Charlotte suburbs)
   - URL: https://www.unioncountync.gov/government/departments/tax/foreclosures
   - Expected: Law firm (Hutchens?) or simple format

3. **Wake County** (1.23M) - Raleigh (already partially researched)
   - URL: Known - individual parcel clicks (complex)
   - Status: Defer - too complex for now

4. **Onslow County** (213K) - Jacksonville
   - URL: Already researched - newspaper ads only
   - Status: No online system

**Expected Result:** 1-2 new scrapers

---

## Batch 6: Medium Counties Part 1 (10 counties, pop. 50K-100K)

**Priority: HIGH - Good balance of volume and simplicity**

1. **Franklin County** (73K)
   - URL: https://www.franklincountync.us/departments/tax_administration/foreclosure_sales.php
   
2. **Harnett County** (141K)
   - URL: https://www.harnett.org/tax/foreclosure-sales
   
3. **Lee County** (63K)
   - URL: https://www.leecountync.gov/departments/tax/foreclosure-sales
   
4. **Lenoir County** (54K)
   - URL: https://www.lenoircountync.gov/departments/tax/foreclosure-sales
   
5. **Robeson County** (116K)
   - URL: https://www.robesoncountync.gov/departments/tax/foreclosure-sales
   
6. **Rockingham County** (91K)
   - URL: https://www.co.rockingham.nc.us/departments/tax/foreclosure-sales
   
7. **Sampson County** (60K)
   - URL: https://www.sampsonnc.com/departments/tax/foreclosure-sales
   
8. **Scotland County** (34K)
   - URL: https://www.scotlandcounty.org/departments/tax/foreclosure-sales
   
9. **Stanly County** (63K)
   - URL: https://www.stanlycountync.gov/departments/tax/foreclosure-sales
   
10. **Stokes County** (44K)
    - URL: https://www.co.stokes.nc.us/departments/tax/foreclosure-sales

**Expected Result:** 3-5 new scrapers

---

## Batch 7: Medium Counties Part 2 (3 counties, pop. 50K-100K)

1. **Vance County** (42K)
   - URL: https://www.vancecounty.org/departments/tax/foreclosure-sales

2. **Cleveland County** (100K)
   - URL: https://www.clevelandcounty.com/departments/tax/foreclosure-sales
   - Note: May be covered by Kania (need to verify)

3. **Iredell County** (206K) - Already researched
   - Status: Clerk of Court only - no online system

**Expected Result:** 1-2 new scrapers

---

## Batch 8: Small Counties Part 1 (10 counties, pop. 20K-50K)

**Priority: MEDIUM - May have simple formats**

1. **Beaufort County** (47K)
   - URL: https://www.beaufortcountync.gov/departments/tax/foreclosure-sales

2. **Bertie County** (17K)
   - URL: https://www.co.bertie.nc.us/departments/tax/foreclosure-sales

3. **Caswell County** (22K)
   - URL: https://www.caswellcountync.gov/departments/tax/foreclosure-sales

4. **Columbus County** (50K)
   - URL: https://www.columbusco.org/departments/tax/foreclosure-sales

5. **Craven County** (100K)
   - URL: https://www.cravencountync.gov/departments/tax/foreclosure-sales

6. **Dare County** (37K)
   - URL: https://www.darenc.com/departments/tax/foreclosure-sales
   - Note: Likely covered by ZLS

7. **Duplin County** (49K)
   - URL: https://www.duplincountync.com/departments/tax/foreclosure-sales

8. **Granville County** (60K)
   - URL: https://www.granvillecounty.org/departments/tax/foreclosure-sales

9. **Montgomery County** (26K)
   - URL: https://www.montgomerycountync.com/departments/tax/foreclosure-sales

10. **Pasquotank County** (40K)
    - URL: https://www.pasquotankcountync.gov/departments/tax/foreclosure-sales

**Expected Result:** 2-4 new scrapers

---

## Batch 9: Small Counties Part 2 (5 counties, pop. 20K-50K)

1. **Person County** (39K)
   - URL: https://www.personcountync.gov/departments/tax/foreclosure-sales

2. **Perquimans County** (13K)
   - URL: Already researched - PDF format (3+ properties)
   - Status: Needs PDF parser

3. **Richmond County** (42K)
   - URL: https://www.richmondnc.com/departments/tax/foreclosure-sales

4. **New Hanover County** (243K) - Already researched
   - Status: Covered by Kania Law Firm

5. **Pender County** - Already researched
   - Status: Uses GovDeals - not scrapable

**Expected Result:** 1-2 new scrapers

---

## Batch 10: Already Partially Researched (14 counties)

**These counties need verification or are already covered:**

**Likely Covered by Law Firms:**
- Beaufort, Bertie, Camden, Caswell, Chatham, Chowan, Columbus, Craven, Currituck, Dare, Duplin, Gates, Granville, Greene, Halifax, Harnett, Hertford, Hyde, Jones, Lee, Lenoir, Martin, Moore, Northampton, Pamlico, Pasquotank, Perquimans, Tyrrell, Washington, Wilson (via ZLS)
- Cleveland, Davidson, Davie, Lincoln, Rowan, Surry (via Kania)

**Need Quick Verification:**
1. Check ZLS coverage list for exact counties
2. Check Kania coverage list for exact counties
3. Only research counties NOT on either list

---

## Expected Final Results

### Optimistic Scenario (Best Case)
- **New scrapers built:** 15-20
- **Final coverage:** 58-63 counties (58-63%)
- **Total properties:** 450-550

### Realistic Scenario (Most Likely)
- **New scrapers built:** 10-15
- **Final coverage:** 53-58 counties (53-58%)
- **Total properties:** 400-500
- **Reason:** Many counties already covered by ZLS/Kania or have no online data

### Conservative Scenario (Worst Case)
- **New scrapers built:** 5-10
- **Final coverage:** 48-53 counties (48-53%)
- **Total properties:** 370-420
- **Reason:** Most viable counties already covered

---

## Research Timeline

**Session 1 (Today):** Batch 5 - Large counties (4 counties)
**Session 2:** Batch 6 - Medium counties Part 1 (10 counties)
**Session 3:** Batch 7 + 8 - Medium Part 2 + Small Part 1 (13 counties)
**Session 4:** Batch 9 + verification (19 counties)

**Total Time:** 4 research sessions + scraper development

---

## Success Metrics

**Target Coverage:** 60-70 counties (60-70%)
**Minimum Acceptable:** 55 counties (55%)
**Stretch Goal:** 75 counties (75%)

**Property Count Target:** 450+ active properties
**Scraper Count Target:** 20-25 total scrapers
