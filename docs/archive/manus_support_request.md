# Manus Support Request - Webdev Project Restoration Failure

## Issue Summary
Unable to restore webdev project after sandbox reset. Project checkpoint exists and is accessible through Management UI, but physical files won't restore to sandbox filesystem.

## Project Details
- **Project Name:** nc-tax-deed-scraper (NC Tax Deed Property Tracker)
- **Latest Checkpoint:** e02e1668
- **Project Link:** manus-webdev://e02e1668
- **Features:** server, db, user
- **Credits Invested:** ~40,000 credits

## Technical Details

### Error Messages
```
Error: [Errno 2] No such file or directory: '/home/ubuntu/nc-tax-deed-scraper'
Failed to start dev server: [Errno 2] No such file or directory: '/home/ubuntu/nc-tax-deed-scraper'
```

### What Happened
1. Sandbox was reset during session
2. Attempted to restore project using `webdev_rollback_checkpoint` tool
3. Rollback command reports success but directory never appears
4. Management UI Code panel CAN see all files
5. Dev server cannot start because files aren't physically present in sandbox

### Attempted Solutions
- Multiple `webdev_rollback_checkpoint` calls with version e02e1668
- Manual directory creation + git init
- Waiting for background restoration (30+ minutes)
- `webdev_check_status` to trigger restoration
- `webdev_restart_server` to trigger restoration

### Current State
- Project checkpoint is intact and accessible
- Management UI shows all project files
- Sandbox filesystem has no project directory at `/home/ubuntu/nc-tax-deed-scraper`
- Dev server status: error
- Cannot run scrapers or access application

## Request
Please manually restore project checkpoint e02e1668 to the sandbox environment, or provide guidance on how to recover the project.

## Impact
Project contains significant work including:
- 16 custom web scrapers for NC tax deed properties
- Complete database schema and migrations
- Full-stack application with authentication
- Admin panel, maps integration, statistics dashboard
- 705 properties with complete data

## Urgency
High - project is inaccessible and represents substantial credit investment.
