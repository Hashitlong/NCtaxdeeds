# Coastal Counties Research - November 1, 2025

## Summary

Researched 4 coastal NC counties (New Hanover, Brunswick, Carteret, Pender). Found that **all are either already covered by existing law firms or have no active listings**.

## County Research Results

### 1. New Hanover County (Wilmington - 234K population)
- **Status**: Covered by Kania Law Firm ✓
- **Current Properties**: 1 active property (4017 Masonboro Loop Road)
- **Format**: County website shows property details but directs bidders to Kania Law Firm
- **Notes**: "Please contact Kania Law Firm, P.A. at 828-252-8010, Ext. 115 for further information"
- **Action**: Already integrated - no new scraper needed

### 2. Brunswick County (142K population)
- **Status**: No online foreclosure listings found
- **Current Properties**: Unknown
- **Format**: County website has no dedicated foreclosure page
- **Notes**: Search results show auction.com listings (3rd party platform)
- **Recommendation**: SKIP - no county-managed online system

### 3. Carteret County (70K population)
- **Status**: Has foreclosure page but currently empty
- **Current Properties**: 0 active sales
- **Format**: HTML table (empty)
- **Page**: https://www.carteretcountync.gov/1149/Tax-Foreclosure-Sales
- **Notes**: "Below is a list of properties with upcoming auction dates (if no properties are listed, please revisit this page as it is updated monthly)"
- **Table Structure**: PARCEL ID | MINIMUM BID | OWNER | DEED BOOK | DEED PAGE | LEGAL DESCRIPTION | DATE OF SALE
- **Recommendation**: Monitor for future listings - good table format when populated

### 4. Pender County (63K population)
- **Status**: Uses GovDeals platform
- **Current Properties**: 0 active foreclosures
- **Format**: GovDeals (external auction platform)
- **Page**: https://pendercountync.gov/464/Tax-Foreclosure-Surplus-Property
- **Notes**: Redirects to GovDeals.com for surplus property sales
- **Recommendation**: SKIP - external platform, not easily scrapable

## Key Findings

### 1. Coastal Counties Rely on Law Firms
New Hanover (the largest coastal county) uses Kania Law Firm, which we already scrape. This pattern suggests other coastal counties may also outsource to law firms.

### 2. Low Current Activity
Despite being tourist/vacation areas with potentially higher foreclosure rates:
- New Hanover: 1 property (via Kania)
- Brunswick: No online system
- Carteret: 0 active
- Pender: 0 active

### 3. Carteret Has Good Format (When Populated)
Carteret County has a clean HTML table format similar to Cumberland/Edgecombe/Hoke. Worth monitoring monthly for when properties are added.

## Comparison with Existing Coverage

**Already Covered by ZLS** (from earlier research):
- Dare County (Outer Banks)
- Craven County (New Bern)
- Beaufort County
- Pamlico County
- Onslow County (Jacksonville)

This means **most major coastal counties are already in our system via ZLS**!

## Coastal Coverage Summary

| County | Population | Status | Properties | Source |
|--------|-----------|--------|------------|--------|
| New Hanover | 234K | ✓ Covered | 1 | Kania Law Firm |
| Brunswick | 142K | ❌ No system | Unknown | N/A |
| Onslow | 204K | ✓ Covered | Unknown | ZLS |
| Craven | 100K | ✓ Covered | Unknown | ZLS |
| Carteret | 70K | ⏳ Empty | 0 | Monitor monthly |
| Pender | 63K | ❌ GovDeals | 0 | External platform |
| Dare | 37K | ✓ Covered | Unknown | ZLS |
| Beaufort | 48K | ✓ Covered | Unknown | ZLS |
| Pamlico | 13K | ✓ Covered | Unknown | ZLS |

**Result**: 6 out of 9 major coastal counties already covered (67%)

## Recommendations

### Short-Term
1. **Monitor Carteret County monthly** - has good table format, just needs properties
2. **Verify ZLS coastal coverage** - confirm Dare, Craven, Onslow, Beaufort, Pamlico are in database

### Long-Term
1. **Skip Brunswick and Pender** - no viable online systems
2. **Check smaller coastal counties**: Currituck, Camden, Pasquotank, Tyrrell, Hyde

## Next Research Targets

Since coastal counties are mostly covered, recommend shifting focus to:

### 1. Mountain Counties (Western NC)
- Henderson (Hendersonville - 120K)
- Haywood (Waynesville - 63K)
- Watauga (Boone - 56K)
- McDowell (Marion - 45K)
- Transylvania, Polk, Yancey

### 2. Piedmont Gaps (Central NC)
- Vance (Henderson - 42K)
- Granville (Oxford - 60K)
- Person (Roxboro - 39K)
- Caswell (Yanceyville - 23K)

### 3. Eastern NC Small Counties
- Nash (Rocky Mount - 94K)
- Halifax (Roanoke Rapids - 50K)
- Bertie (Windsor - 19K)
- Sampson (Clinton - 60K)

## Conclusion

**Coastal counties research yielded no new scrapers** - most are already covered by Kania Law Firm or ZLS. The only potential future opportunity is Carteret County, which has a good table format but is currently empty.

**Recommendation**: Pivot to mountain counties (Western NC) for next research phase, as they are less likely to be covered by existing law firms and may have simpler county-managed systems.
