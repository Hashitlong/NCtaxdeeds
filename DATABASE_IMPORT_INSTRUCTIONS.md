# Database Import Instructions

This file contains instructions for importing the clean database with 925 properties and 100% source link coverage.

## What's Included

- **database_dump.sql** - Complete SQL dump with 925 properties
- All properties have `sourceUrl` and `sourceType` fields populated
- This enables the "Link" column to display clickable source names (Kania Law, ZLS, etc.)

## Prerequisites

1. MySQL or compatible database server installed
2. Database connection credentials (host, username, password, database name)
3. Command line access or database management tool (like phpMyAdmin, MySQL Workbench, or DBeaver)

## Import Methods

### Method 1: Using Command Line (Recommended)

```bash
# 1. Navigate to the project directory
cd nc-tax-deed-scraper

# 2. Import the SQL dump
mysql -h YOUR_HOST -u YOUR_USERNAME -p YOUR_DATABASE_NAME < database_dump.sql

# Example:
mysql -h localhost -u root -p tax_deed_db < database_dump.sql
```

### Method 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Go to **Server** → **Data Import**
4. Select **Import from Self-Contained File**
5. Browse and select `database_dump.sql`
6. Select your target database
7. Click **Start Import**

### Method 3: Using phpMyAdmin

1. Log in to phpMyAdmin
2. Select your database from the left sidebar
3. Click the **Import** tab
4. Click **Choose File** and select `database_dump.sql`
5. Scroll down and click **Go**

### Method 4: Using DBeaver

1. Open DBeaver
2. Connect to your database
3. Right-click on your database → **Tools** → **Execute Script**
4. Select `database_dump.sql`
5. Click **Execute**

## What the Import Does

The SQL file will:

1. **TRUNCATE TABLE properties** - Clears all existing property data
2. **INSERT** 925 properties with complete data including:
   - Property details (address, parcel ID, etc.)
   - Sale information (dates, bids, status)
   - Source information (`sourceUrl` and `sourceType`)
   - Timestamps (first scraped, last updated)

## After Import

1. Verify the import:
   ```sql
   SELECT COUNT(*) FROM properties;
   -- Should return: 925
   
   SELECT COUNT(*) FROM properties WHERE sourceType IS NOT NULL;
   -- Should return: 925 (100% coverage)
   ```

2. Start your application:
   ```bash
   pnpm install
   pnpm dev
   ```

3. Visit the Properties page - you should see:
   - **Total Properties**: 925
   - **Link column** showing clickable source names (Kania Law, ZLS, Hutchens, etc.)
   - No "—" dashes in the Link column

## Troubleshooting

### Error: "Table 'properties' doesn't exist"

You need to run the database migrations first:

```bash
pnpm db:push
```

This creates the table structure. Then import the data using the SQL dump.

### Error: "Access denied"

Check your database credentials in the `.env` file or connection string.

### Import is very slow

This is normal for 925 records. It may take 1-2 minutes depending on your database server.

### Some properties still show "—" in Link column

This means the import didn't complete successfully. Try:

1. Check for error messages during import
2. Verify the SQL file is complete (should be ~802KB)
3. Try a different import method

## Need Help?

If you're not comfortable with databases, you can:

1. Use **Cursor IDE** or **GitHub Copilot** - paste these instructions and ask:
   - "Help me import this SQL file into my database"
   - "Show me how to connect to MySQL and run this import"

2. Use **Claude** or **ChatGPT** - share this file and ask:
   - "I need help importing a MySQL database dump"
   - "Walk me through database import step by step"

3. The SQL file is standard MySQL format and works with any MySQL-compatible database (MySQL, MariaDB, TiDB, etc.)

## Database Schema

The properties table includes these key fields for the Link column:

- `sourceUrl` - The URL to the original listing page
- `sourceType` - The source identifier ('kania', 'zls', 'hutchens', 'rbcwb', 'county', 'pdf')

The frontend uses these fields to display clickable links in the Link column.
