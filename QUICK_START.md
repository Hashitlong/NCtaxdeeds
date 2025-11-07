# Quick Start Guide - NC Tax Deed Property Tracker

**Last Updated:** November 6, 2025

This project can be run in two ways:

## Option 1: Run Locally on Your Computer

**Best for:** Testing, development, or running on your own network

**Time:** 30-45 minutes  
**Cost:** Free (except database hosting if using TiDB Cloud)

### Quick Steps:

1. **Install Prerequisites:**
   - Node.js 22+ ([nodejs.org](https://nodejs.org/))
   - pnpm: `npm install -g pnpm`
   - MySQL or TiDB Cloud account

2. **Download the Project:**
   - Download ZIP from Manus Code panel
   - Extract to a folder on your computer

3. **Easy Setup (Recommended):**
   ```bash
   cd /path/to/nc-tax-deed-scraper
   pnpm install
   node setup-local.js
   ```
   Follow the prompts to configure your database and settings.

4. **Create Database Tables:**
   ```bash
   pnpm db:push
   ```

5. **Start the Application:**
   ```bash
   pnpm dev
   ```
   Open http://localhost:3000 in your browser

**For detailed instructions, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)**

---

## Option 2: Deploy to the Cloud (Railway)

**Best for:** Production use, team access from anywhere

**Time:** 20-30 minutes  
**Cost:** ~$5-10/month

### Quick Steps:

1. **Create GitHub Repository:**
   - Push your code to GitHub

2. **Sign up for Railway:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account

3. **Deploy:**
   - Create new project from GitHub repo
   - Add MySQL database
   - Configure environment variables
   - Railway automatically deploys

4. **Access Your App:**
   - Railway provides a public URL
   - Share with your team

**For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## Which Option Should I Choose?

| Scenario | Recommended Option |
|----------|-------------------|
| Just want to test it out | **Option 1** (Local) |
| Need team access from different locations | **Option 2** (Cloud) |
| Want to customize/develop features | **Option 1** (Local) |
| Need it running 24/7 | **Option 2** (Cloud) |
| Limited budget | **Option 1** (Local - Free) |
| Want automatic backups and scaling | **Option 2** (Cloud) |

---

## Need Help?

- **Local Setup Issues:** See [LOCAL_SETUP.md](./LOCAL_SETUP.md) → Troubleshooting section
- **Deployment Issues:** See [DEPLOYMENT.md](./DEPLOYMENT.md) → Troubleshooting section
- **General Questions:** Check the README.md file

---

## What's Included

This application includes:

✅ **Property Database** - Store and search tax deed properties (currently 763 properties)  
✅ **Map View** - Visualize properties on an interactive map  
✅ **Favorites System** - Save properties for quick access (personal + team favorites)  
✅ **Team Collaboration** - See what your team members have favorited (blue stars)  
✅ **Statistics Dashboard** - View analytics and trends  
✅ **Automated Scrapers** - 21 scrapers covering 82-86 NC counties:
  - Kania Law Firm (28 counties)
  - Hutchens Law Firm (64+ counties)
  - ZLS/Zacchaeus Legal Services (30 counties)
  - RBCWB Law Firm (Mecklenburg)
  - 14 individual county scrapers
✅ **Notifications** - Get alerts for important updates  
✅ **Admin Panel** - Manage scrapers and system settings

**Coverage:** 82-86 out of 100 NC counties (some overlap between sources)

---

## System Requirements

**Minimum:**
- 4 GB RAM
- 2 GB free disk space
- Internet connection
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Recommended:**
- 8 GB RAM
- 5 GB free disk space
- Stable internet connection

---

## First-Time Setup Checklist

After getting the application running, complete these steps:

- [ ] Access the application in your browser
- [ ] Verify the homepage loads correctly
- [ ] Check that the database connection works (Browse Properties page)
- [ ] Test the Map View
- [ ] Access the Admin Panel (if you're the owner)
- [ ] Configure at least one county scraper
- [ ] Run a test scrape to add properties
- [ ] Add a property to favorites
- [ ] Invite team members (if using cloud deployment)

---

## Quick Command Reference

```bash
# Install dependencies
pnpm install

# Interactive setup (creates .env file)
node setup-local.js

# Create/update database tables
pnpm db:push

# Start development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Check for errors
pnpm check
```

---

## Important Files

| File | Purpose |
|------|---------|
| `LOCAL_SETUP.md` | Detailed local setup instructions |
| `DEPLOYMENT.md` | Detailed cloud deployment instructions |
| `setup-local.js` | Interactive setup helper script |
| `.env` | Your configuration (YOU CREATE THIS) |
| `package.json` | Project dependencies and scripts |
| `drizzle/schema.ts` | Database table definitions |

---

## Support

If you encounter issues:

1. Check the troubleshooting section in the relevant guide (LOCAL_SETUP.md or DEPLOYMENT.md)
2. Review error messages carefully—they often tell you what's wrong
3. Search for the error message online
4. Contact your technical support team

---

**Ready to get started?**

- **For local setup:** Open [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- **For cloud deployment:** Open [DEPLOYMENT.md](./DEPLOYMENT.md)

Good luck! 🚀
