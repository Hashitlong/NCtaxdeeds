# NC Tax Deed Property Tracker - User Guide

**Version 1.0** | **Last Updated: November 2, 2025** | **Author: Manus AI**

---

## Introduction

The NC Tax Deed Property Tracker is a comprehensive web application designed to help investors, real estate professionals, and interested buyers track tax foreclosure properties across all 100 counties in North Carolina. The system automatically scrapes data from law firm websites and county sources, providing real-time information about upcoming sales, upset bid periods, and property details.

### Key Features

The application provides powerful tools for property research and management. Users can browse and filter properties using advanced search criteria including county, status, bid amounts, and sale dates. The interactive map view displays properties geographically with clickable markers showing detailed information. Statistical dashboards offer insights into market trends with charts showing property distribution by county and status. Users can save custom filter combinations for quick access and star favorite properties for later review. The system tracks property history including bid changes and status transitions, while CSV export functionality allows data analysis in external tools.

### System Coverage

Currently, the system tracks **344+ active properties** across **43 counties with active listings**. The scrapers cover **64 out of 100 North Carolina counties**, with data sources including Kania Law Firm (28 counties), Zacchaeus Legal Services (30 counties), and custom county-specific scrapers (16 counties). The system automatically updates daily to ensure the latest property information is available.

---

## Getting Started

### Accessing the System

Navigate to the application URL and log in using your Manus OAuth credentials. Upon successful authentication, you will see the home page with navigation buttons for all major features. The clean, modern interface provides quick access to Browse Properties, Map View, Statistics, Admin Panel, Saved Searches, Favorites, and Recently Sold pages.

### Home Page Overview

The home page serves as the central hub for navigation. Three feature cards highlight the system's core capabilities: **Automated Scraping** ensures daily updates from law firm websites and county sources, **Statewide Coverage** tracks 43 counties with active listings out of 64 covered counties, and **Upset Bid Tracking** monitors North Carolina's unique 10-day upset bid process with automatic tracking of bid deadlines and current amounts.

---

## Core Features

### Browse Properties

The Properties page is the primary interface for searching and filtering tax deed properties. At the top, four statistics cards display Total Properties, In Upset Period count, Scheduled sales, and New Properties added in the last 7 days.

#### Advanced Filtering

The comprehensive filter panel allows precise property searches. Select specific counties from the dropdown menu showing all 64 covered counties. Filter by sale status including Scheduled, In Upset Period, Sold, or Cancelled. Set minimum and maximum opening bid amounts to find properties in your price range. Choose sale date ranges to focus on upcoming or past sales. The search box enables quick lookups by address, owner name, or parcel ID. After applying filters, use the "Clear All" button to reset and start a new search.

#### Property Table

The results table displays key information for each property. Columns include Address, County, Property Type, Sale Status with color-coded badges, Opening Bid and Current Bid amounts, Sale Date, and Upset Bid Deadline. Each row features a star icon to add properties to favorites and a clickable row that opens the detailed property dialog. The table is mobile-responsive with horizontal scrolling on smaller screens.

#### Saving Searches

After configuring filters to your preferences, click the "Save Search" button in the filter panel. Enter a descriptive name like "Mecklenburg County Under $50k" and click Save. Your filter combination is now saved and accessible from the Saved Searches page for quick reapplication.

#### Exporting Data

Click the "Export CSV" button to download all filtered properties to a CSV file. The export includes all property fields with an auto-generated filename like `nc-tax-deed-properties-2025-11-02.csv`. Open the file in Excel or Google Sheets for further analysis.

### Property Details

Click any property row to open the detailed property dialog. The dialog displays comprehensive information including full address, county and property type, parcel ID with a link to county records, opening bid and current bid amounts, sale date and upset bid deadline, sale status with visual badge, property source and URL to the county website, and timestamps for when the property was added and last updated. Use the "View on County Website" button to access official county records for verification.

### Map View

The Map View provides geographic visualization of properties across North Carolina. The interactive Google Map displays properties as clickable markers with clustering for areas with multiple properties.

#### Using the Map

The map loads centered on North Carolina showing all geocoded properties. Click any marker to see a popup with property address, county, sale date, and bid amounts. Click "View Details" in the popup to open the full property dialog. Use the map controls to zoom in/out, pan, and switch between map and satellite views. The marker clusters (numbered badges) indicate multiple properties in close proximity—click to zoom in and separate them.

#### Map Statistics

Three statistics cards above the map show Total Properties (344), On Map (252 geocoded), and Need Geocoding (92 without coordinates). Properties without addresses cannot be geocoded and won't appear on the map.

#### Geocoding Properties

If you have admin access, click the "Geocode Properties" button to convert addresses to map coordinates using the Google Maps Geocoding API. The process runs in the background and may take several minutes for large batches.

### Statistics Dashboard

The Statistics page provides comprehensive analytics and insights into the property database. Four overview cards display Total Properties, Counties with Data, Total Bid Amount (sum of all opening bids), and Average Bid per property.

#### Charts and Visualizations

The **Properties by County** bar chart shows the top 15 counties ranked by property count, making it easy to identify hotspots for tax deed sales. The **Status Distribution** pie chart visualizes the breakdown of properties by status (Scheduled, In Upset Period, Sold, Cancelled), helping you understand the current market state.

#### County Comparison Table

The detailed table ranks all 43 counties with active properties, showing County Name, Property Count, Total Bid Amount (sum of all opening bids), and Average Bid per property. Click column headers to sort by any metric. This table helps identify counties with the most opportunities or lowest average bids.

#### Upcoming Sales Calendar

Click the "View Calendar" button to access the Upcoming Sales Calendar. This dedicated page shows properties grouped by sale date with countdown badges indicating days until sale. Filter by time range (30, 60, 90, or 180 days) to focus on near-term or longer-term opportunities. Each property card displays address, county, status, and bid amounts. The "Add Manual Sale Date" button allows admin users to track sales from non-scrapable counties.

### Saved Searches

The Saved Searches page displays all your saved filter combinations for quick access. Each saved search card shows the search name, filter summary (e.g., "County: Mecklenburg, Max Bid: $50,000"), and creation date.

#### Managing Saved Searches

Click "Apply Filters" on any saved search to navigate to the Properties page with those filters pre-applied. Use the trash icon to delete searches you no longer need. Click the "Export CSV" button at the top to download a list of all your saved searches with their filter configurations.

### Favorites

The Favorites page displays all properties you've starred for quick access. Each property card shows the full address, county and property type, sale status badge, opening and current bid amounts, sale date and upset bid deadline, and a button to view on the county website.

#### Managing Favorites

Click the star icon (filled yellow) to remove a property from favorites. Click "View Details" to open the full property dialog. Use the "Export CSV" button at the top to download all your favorite properties with complete details.

### Recently Sold

The Recently Sold page tracks completed tax deed sales, showing which properties sold and for how much. This historical data helps you understand market trends and successful bid amounts.

#### Sold Property Information

Each sold property card displays the final sale information including address and county, sold status badge, opening bid and final bid amounts, bid change percentage (e.g., "+15%" if final bid exceeded opening), sale date, and days on market (time from listing to sale). This information helps you gauge competition levels and typical bid increases in different counties.

---

## Admin Features

### Admin Panel

Users with admin privileges can access the Admin Panel to manage scrapers and monitor system health. The health status dashboard displays four key metrics: Total Scrapers (16 active data sources), Successful Runs in the last 24 hours, Failed Runs requiring attention, and Properties Tracked (344+ across 43 counties).

#### Running Scrapers

The panel displays cards for each scraper including Kania Law Firm (30+ counties), Hutchens Law Firm, Wake County, RBCWB, Forsyth County, and others. Click the "Run Scraper" button on any card to manually trigger a scrape. The system will display a toast notification showing progress and results. After completion, the scrape history table updates with the new run.

#### Scrape History

The history table shows recent scraper runs with columns for Scraper Name, Status (Success/Partial/Failed with color-coded badges), Properties Found, Start Time, and Duration. This helps you monitor scraper performance and identify any issues requiring attention.

---

## Tips and Best Practices

### Effective Property Research

Start your research by using the county filter to focus on your target areas. Save multiple searches for different criteria (e.g., "Low Bids Under $25k", "Upcoming This Month", "Mecklenburg County All"). Check the map view to understand property locations and neighborhood context. Review the Statistics dashboard weekly to identify trending counties with new opportunities. Star promising properties immediately so you don't lose track of them.

### Monitoring Upset Bid Periods

North Carolina's upset bid process allows anyone to submit a higher bid within 10 days of the initial sale. Use the "In Upset Period" status filter to find properties currently accepting upset bids. Check the Upset Bid Deadline column to know how much time remains. Visit the county website (via "View on County Website") for official bid submission instructions. Monitor your favorite properties daily during their upset period to see if bids increase.

### Data Export and Analysis

Export filtered property lists to CSV for deeper analysis in Excel or Google Sheets. Create pivot tables to analyze properties by county, price range, or property type. Compare opening bids to final sold prices (from Recently Sold) to understand typical bid increases. Track properties over time by exporting weekly and comparing changes.

---

## Troubleshooting

### Properties Not Appearing on Map

If properties don't show on the map, they may lack address information or geocoding. Check the "Need Geocoding" counter on the Map View page. Admin users can click "Geocode Properties" to convert addresses to coordinates. Some properties from certain counties may not have complete address data.

### Filters Not Working

If filters don't seem to work, verify you've clicked "Apply Filters" after making changes. Check that you haven't set conflicting criteria (e.g., max bid lower than min bid). Use "Clear All" to reset filters and start fresh. Refresh the page if filters appear stuck.

### Export Issues

If CSV exports fail to download, check your browser's popup blocker settings. Ensure you have write permissions to your Downloads folder. Try a different browser if issues persist. Contact support if exports consistently fail.

---

## Frequently Asked Questions

**Q: How often is property data updated?**  
A: Scrapers run automatically daily to ensure the latest information. Admin users can also trigger manual scrapes at any time.

**Q: Why do some properties show "Address not available"?**  
A: Some county sources don't provide complete address information. We display all available data even if certain fields are missing.

**Q: What is an "upset bid"?**  
A: In North Carolina, after a property is sold at auction, there's a 10-day period where anyone can submit a higher bid (at least 5% more). This is called the upset bid period.

**Q: Can I track properties in counties not currently covered?**  
A: Currently, 64 out of 100 NC counties are covered by scrapers. We're continuously adding new counties. Check the Statistics page for the current list.

**Q: How do I know if a property is a good deal?**  
A: Compare the opening bid to typical property values in that area. Review the Recently Sold page to see what similar properties sold for. Consider additional costs like back taxes, liens, and property condition.

**Q: Can I set up alerts for new properties?**  
A: Email notifications are planned for a future update. Currently, check the "New (Last 7 Days)" counter on the Properties page regularly.

---

## Support and Contact

For technical issues, feature requests, or questions about the system, please contact your system administrator or submit feedback through the Manus support portal at https://help.manus.im.

---

**End of User Guide**
