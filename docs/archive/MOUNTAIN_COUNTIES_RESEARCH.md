# Mountain Counties Research - November 1, 2025

## Summary

Researched 4 mountain NC counties (Henderson, Haywood, Watauga, McDowell). Found **McDowell County** has 2 active properties with a scrapable HTML table format.

## County Research Results

### 1. Henderson County (Hendersonville - 120K population)
- **Status**: Has foreclosure page but currently empty
- **Current Properties**: 0 active sales
- **Format**: HTML table (empty)
- **Page**: https://www.hendersoncountync.gov/tax/page/tax-foreclosure-sales
- **Notes**: "Sales are conducted on the courthouse steps at 200 North Grove St, Hendersonville, NC 28792"
- **Recommendation**: Monitor for future listings - good table format when populated

### 2. Haywood County (Waynesville - 63K population)
- **Status**: Uses Bid4Assets platform
- **Current Properties**: 4 properties on Bid4Assets
- **Format**: External auction platform (Bid4Assets)
- **Page**: https://www.haywoodcountync.gov/337/Tax-Foreclosures
- **Notes**: "Tax Foreclosure Sale #4- December 4th, 2025 at 10:00am" on Bid4Assets
- **Recommendation**: SKIP - external platform, not easily scrapable

### 3. Watauga County (Boone - 56K population)
- **Status**: No online foreclosure system found
- **Current Properties**: Unknown
- **Format**: No dedicated foreclosure page
- **Page**: https://www.wataugacounty.org/App_Pages/Dept/Tax/taxcollections.aspx
- **Notes**: Tax collections page exists but no foreclosure listings
- **Recommendation**: SKIP - no county-managed online system

### 4. McDowell County (Marion - 45K population) ✓
- **Status**: Active foreclosure page with properties
- **Current Properties**: 2 active sales
- **Format**: Clean HTML table
- **Page**: https://www.mcdowellgov.com/departments/tax-collections/tax-foreclosures/upcoming-tax-foreclosure-sales
- **Table Structure**: 
  - ORIGINAL SALE DATE
  - 10-DAY UPSET BID PERIOD ENDS
  - PARCEL NUMBER
  - HIGHEST BID RECORDED
  - FILE NUMBER
- **Properties**:
  1. Parcel 0731-00-21-9654 - $14,250 bid - Sale: 09/26/2025 - Upset period ends: 11/10/2025
  2. Parcel 1712-18-20-5044 - $50,000 bid - Sale: 10/17/2025 - Upset period ends: 11/10/2025
- **Recommendation**: BUILD SCRAPER ✓

## Key Findings

### 1. Mountain Counties Have Low Foreclosure Activity
Despite being tourist/vacation areas:
- Henderson: 0 active
- Haywood: 4 properties (external platform)
- Watauga: No online system
- McDowell: 2 active

### 2. External Platforms Common
- Haywood uses Bid4Assets
- Henderson also mentioned Bid4Assets in search results
- These platforms are harder to scrape than county websites

### 3. McDowell Has Good Format
Clean HTML table with:
- Parcel numbers
- Bid amounts
- Sale dates
- Upset bid period end dates
- File numbers

Similar format to Cumberland, Edgecombe, Hoke - should be straightforward to scrape.

## Mountain Coverage Summary

| County | Population | Status | Properties | Action |
|--------|-----------|--------|------------|--------|
| Henderson | 120K | ⏳ Empty | 0 | Monitor monthly |
| Haywood | 63K | ❌ Bid4Assets | 4 | External platform |
| Watauga | 56K | ❌ No system | Unknown | N/A |
| McDowell | 45K | ✓ Build scraper | 2 | **BUILD SCRAPER** |

**Result**: 1 out of 4 mountain counties has scrapable listings (25%)

## Next Steps

### Immediate
1. **Build McDowell County scraper** - 2 properties, clean table format
2. **Monitor Henderson County monthly** - has good table format, just needs properties

### Future Research
Check other mountain counties:
- Transylvania (Brevard - 34K)
- Polk (Columbus - 20K)
- Yancey (Burnsville - 18K)
- Mitchell (Bakersville - 15K)
- Avery (Newland - 18K)

## McDowell County Scraper Design

### Table Structure
```html
<table>
  <thead>
    <tr>
      <th>ORIGINAL SALE DATE</th>
      <th>10-DAY UPSET BID PERIOD ENDS</th>
      <th>PARCEL NUMBER</th>
      <th>HIGHEST BID RECORDED</th>
      <th>FILE NUMBER</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>09/26/2025</td>
      <td>11/10/2025</td>
      <td>0731-00-21-9654</td>
      <td>$14,250.00</td>
      <td>25-CVD-000384</td>
    </tr>
  </tbody>
</table>
```

### Scraper Requirements
- Parse HTML table rows
- Extract parcel number (use as property ID)
- Extract highest bid as minimum bid
- Extract original sale date
- Extract upset bid period end date
- Determine status:
  - If current date < original sale date: "scheduled"
  - If current date >= original sale date AND current date <= upset period end: "in_upset_period"
  - If current date > upset period end: "sold" (shouldn't be on page)

### Property Mapping
- **parcelId**: PARCEL NUMBER
- **minimumBid**: HIGHEST BID RECORDED (parse dollar amount)
- **saleDate**: ORIGINAL SALE DATE
- **upsetBidDeadline**: 10-DAY UPSET BID PERIOD ENDS
- **county**: "McDowell"
- **address**: Need to lookup from parcel number (GIS or tax records)
- **owner**: Need to lookup from parcel number
- **status**: Calculate based on dates

### Challenges
- No address or owner in table - need to lookup from parcel number
- May need to use McDowell County GIS or tax records API
- Alternative: Store just parcel number and let users lookup details

## Conclusion

**Mountain counties research yielded 1 new scraper opportunity**: McDowell County with 2 properties.

Henderson County is a good future target (clean table format, just currently empty).

**Current expansion status**:
- Coastal counties: 0 new scrapers (already covered by law firms)
- Medium counties: 0 new scrapers (already covered by law firms)
- Mountain counties: 1 new scraper (McDowell County)

**Total new scrapers from expansion effort**: 2 (Cumberland + McDowell)

**Recommendation**: Build McDowell County scraper, then pivot to researching small/rural counties (20K-50K population) which are less likely to be covered by law firms.
