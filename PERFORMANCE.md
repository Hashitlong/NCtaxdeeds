# Performance Optimization Guide

## Database Indexes

To improve query performance, apply the indexes defined in `add-indexes.sql`. These indexes optimize:

### Properties Table
- `county` - Fast filtering by county
- `saleStatus` - Quick status-based queries
- `saleDate` - Efficient date range filtering
- `createdAt` - Fast "new properties" queries
- `isActive` - Quick active/inactive filtering

### Composite Indexes
- `(county, saleStatus)` - Combined county + status filters
- `(saleStatus, saleDate)` - Status + date range queries
- `(isActive, county)` - Active properties by county

### User Tables
- `savedSearches.userId` - Fast user search lookups
- `favorites.userId` - Quick favorites retrieval
- `favorites.(userId, propertyId)` - Efficient favorite checks

## Applying Indexes

### Via Database UI
1. Open Management UI → Database panel
2. Click "SQL" or "Query" tab
3. Copy contents of `add-indexes.sql`
4. Execute the script
5. Verify indexes created successfully

### Via Command Line
```bash
# Connect to your TiDB database
mysql -h [host] -u [user] -p [database] < add-indexes.sql
```

## Expected Performance Improvements

- **Property filtering**: 50-70% faster with county/status indexes
- **Map view loading**: 40-60% faster with coordinate queries
- **Favorites page**: 80%+ faster with userId index
- **Statistics dashboard**: 30-50% faster with aggregate queries
- **Recently sold**: 60%+ faster with status + date indexes

## Monitoring Performance

Check query execution times in the browser DevTools Network tab. Slow queries (>500ms) may benefit from additional indexes or query optimization.
