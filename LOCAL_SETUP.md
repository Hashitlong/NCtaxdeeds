# NC Tax Deed Property Tracker - Local Setup Guide

**Last Updated:** November 6, 2025  
**Author:** Manus AI  
**Difficulty:** Beginner-Friendly  
**Time Required:** 30-45 minutes

This guide will help you run the NC Tax Deed Property Tracker on your own computer (locally) outside of the Manus platform. Every step is explained in simple terms with detailed instructions.

---

## What You'll Need

Before starting, you need to install some free software on your computer. Don't worry—each one has a simple installer that guides you through the process.

### 1. Install Node.js (JavaScript Runtime)

**What it does:** Node.js lets your computer run JavaScript code, which is what this application is built with.

**How to install:**
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Click the big green button that says "Download Node.js (LTS)"
3. Run the downloaded installer
4. Click "Next" through all the steps (the default settings are fine)
5. Click "Finish" when done

**How to verify it worked:**
1. Open your Terminal (Mac) or Command Prompt (Windows)
   - **Windows:** Press `Windows Key + R`, type `cmd`, press Enter
   - **Mac:** Press `Command + Space`, type `terminal`, press Enter
2. Type this command and press Enter:
   ```bash
   node --version
   ```
3. You should see something like `v22.13.0` (the numbers might be different, that's okay)

### 2. Install pnpm (Package Manager)

**What it does:** pnpm downloads and manages all the code libraries this application needs.

**How to install:**
1. Open your Terminal/Command Prompt (same as above)
2. Type this command and press Enter:
   ```bash
   npm install -g pnpm
   ```
3. Wait for it to finish (you'll see a progress bar)

**How to verify it worked:**
```bash
pnpm --version
```
You should see a version number like `9.0.0` or similar.

### 3. Install MySQL (Database)

**What it does:** MySQL stores all your property data, favorites, and user information.

**Option A: MySQL Community Server (Recommended for Windows/Mac)**
1. Go to [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Click "Download" for your operating system (Windows or macOS)
3. You might need to create a free Oracle account (it's quick)
4. Run the installer
5. **IMPORTANT:** During installation, you'll be asked to create a "root password"
   - Choose a password you'll remember (write it down!)
   - Example: `MyPassword123!`
6. Finish the installation

**Option B: TiDB Cloud (Easier, No Installation)**
1. Go to [https://tidbcloud.com/](https://tidbcloud.com/)
2. Click "Sign Up" and create a free account
3. Click "Create Cluster" → Choose "Free Tier"
4. Wait 2-3 minutes for your database to be created
5. Click "Connect" and copy the connection string (it looks like `mysql://username:password@host:port/database`)
6. Save this connection string—you'll need it later

**How to verify MySQL is working (Option A only):**
1. Open Terminal/Command Prompt
2. Type:
   ```bash
   mysql --version
   ```
3. You should see something like `mysql  Ver 8.0.35`

---

## Download the Project

Now you need to get the project files onto your computer.

### Step 1: Download from Manus

1. In the Manus interface, find the **Code** panel on the right side
2. Click the **"Download"** button (it looks like a download icon)
3. Save the ZIP file to your computer (for example, to your Desktop or Documents folder)
4. **Extract the ZIP file:**
   - **Windows:** Right-click the ZIP file → "Extract All" → Choose a location → Click "Extract"
   - **Mac:** Double-click the ZIP file (it extracts automatically)

### Step 2: Open the Project Folder

1. Open Terminal/Command Prompt
2. Navigate to where you extracted the files. For example:
   - **Windows:** 
     ```bash
     cd C:\Users\YourName\Documents\nc-tax-deed-scraper
     ```
   - **Mac:**
     ```bash
     cd ~/Documents/nc-tax-deed-scraper
     ```
   - **Tip:** You can drag the folder from File Explorer/Finder into the Terminal window to automatically type the path!

### Step 3: Install Project Dependencies

This downloads all the code libraries the project needs.

1. In your Terminal/Command Prompt (make sure you're in the project folder), type:
   ```bash
   pnpm install
   ```
2. Wait for it to finish (this might take 2-5 minutes)
3. You'll see lots of text scrolling by—this is normal!
4. When it's done, you'll see a message like "Packages: +XXX" and your command prompt will return

---

## Set Up the Database

The application needs a database to store information. Let's create it and set it up.

### Step 1: Create the Database

**If you're using MySQL locally:**

1. Open Terminal/Command Prompt
2. Log into MySQL (you'll need the root password you created during installation):
   ```bash
   mysql -u root -p
   ```
3. Enter your password when prompted
4. You should see a `mysql>` prompt
5. Type these commands one at a time, pressing Enter after each:
   ```sql
   CREATE DATABASE nc_tax_deed_tracker;
   CREATE USER 'nc_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
   GRANT ALL PRIVILEGES ON nc_tax_deed_tracker.* TO 'nc_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```
   - **Note:** Replace `SecurePassword123!` with your own password (write it down!)

**If you're using TiDB Cloud:**
- Your database is already created! Just keep the connection string you copied earlier.

### Step 2: Create the .env File

The `.env` file tells the application how to connect to your database and other important settings.

1. In your project folder, create a new file called `.env` (yes, it starts with a dot!)
   - **Windows:** Open Notepad → File → Save As → Type `.env` → Save in project folder
   - **Mac:** Open TextEdit → Format → Make Plain Text → File → Save → Type `.env` → Save in project folder
   - **Or use VS Code/any code editor:** Just create a new file named `.env`

2. Copy and paste this template into your `.env` file:

```env
# Database Connection
DATABASE_URL="mysql://nc_user:SecurePassword123!@localhost:3306/nc_tax_deed_tracker"

# Application Settings
NODE_ENV="development"
PORT=3000

# Security (change this to a random string!)
JWT_SECRET="change-this-to-a-long-random-string-abc123xyz789"

# Your Information (for admin access)
OWNER_OPEN_ID="your-email@example.com"
OWNER_NAME="Your Name"

# Application Branding
VITE_APP_TITLE="NC Tax Deed Property Tracker"
VITE_APP_LOGO="/logo.png"

# OAuth (leave empty if not using Manus OAuth)
VITE_APP_ID=""
OAUTH_SERVER_URL=""
VITE_OAUTH_PORTAL_URL=""

# Built-in Services (leave empty if not using)
BUILT_IN_FORGE_API_URL=""
BUILT_IN_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_URL=""
```

3. **Now customize these values:**

| What to Change | What to Put | Example |
|----------------|-------------|---------|
| `DATABASE_URL` | Your database connection string | `mysql://nc_user:SecurePassword123!@localhost:3306/nc_tax_deed_tracker` |
| `JWT_SECRET` | A long random string (just mash your keyboard!) | `kj3h4k5j6h7k8j9h0k1j2h3k4j5h6k7j8h9k0` |
| `OWNER_OPEN_ID` | Your email address | `roger@example.com` |
| `OWNER_NAME` | Your full name | `Roger Johnson` |

**For DATABASE_URL:**
- If using **MySQL locally**: `mysql://nc_user:YOUR_PASSWORD@localhost:3306/nc_tax_deed_tracker`
  - Replace `YOUR_PASSWORD` with the password you created in Step 1
- If using **TiDB Cloud**: Paste the connection string you copied earlier

4. **Save the file**

**IMPORTANT:** Never share this `.env` file with anyone! It contains sensitive passwords.

### Step 3: Create Database Tables

Now we'll create all the tables the application needs to store data.

1. In Terminal/Command Prompt (in your project folder), run:
   ```bash
   pnpm db:push
   ```
2. You'll see output showing tables being created:
   ```
   ✓ Generating migrations...
   ✓ Applying migrations...
   ✓ Done!
   ```
3. If you see any errors, double-check your `DATABASE_URL` in the `.env` file

---

## Run the Application

You're almost there! Let's start the application.

### Step 1: Start the Development Server

1. In Terminal/Command Prompt (in your project folder), run:
   ```bash
   pnpm dev
   ```
2. You'll see output like this:
   ```
   Server running on http://localhost:3000/
   [OAuth] Initialized with baseURL: https://api.manus.im
   ```
3. **Don't close this Terminal window!** The application is running as long as this window is open.

### Step 2: Open the Application in Your Browser

1. Open your web browser (Chrome, Firefox, Safari, Edge—any will work)
2. Go to this address:
   ```
   http://localhost:3000
   ```
3. You should see the NC Tax Deed Property Tracker homepage!

### Step 3: Test It Out

Try these things to make sure everything works:

1. **Click "Browse Properties"** - You'll see an empty table (no properties yet, that's normal)
2. **Click "Map"** - The map should load (it will be empty until you add properties)
3. **Click "Statistics"** - You should see charts (they'll show zero data initially)
4. **Click "Favorites"** - You can add favorites once you have properties

---

## Adding Property Data

Your database is empty right now. Here's how to add properties:

### Option 1: Run the Scrapers (Advanced)

The project includes **21 scrapers** that automatically fetch property data from law firms and county websites:
- **Law Firm Scrapers:** Kania (28 counties), Hutchens (64+ counties), ZLS (30 counties), RBCWB (Mecklenburg)
- **County Scrapers:** 14 individual counties (Alamance, Anson, Bladen, Cabarrus, Catawba, Cumberland, Edgecombe, Forsyth, Gaston, Hoke, McDowell, Rutherford, Wake, Yadkin)

1. In a **new** Terminal window (keep the first one running!), navigate to your project folder
2. Run a scraper for a specific source:
   ```bash
   # Run a law firm scraper (recommended - covers multiple counties)
   tsx scrapers/kania_scraper.ts
   
   # Or run a county-specific scraper
   tsx scrapers/wake_county_scraper.ts
   ```
3. Wait for it to finish (you'll see progress messages)
4. Refresh the Properties page in your browser—you should see new properties!

### Option 2: Add Properties Manually (Easier)

1. Access your database using a MySQL client (like MySQL Workbench or phpMyAdmin)
2. Insert properties directly into the `properties` table
3. Or wait for the automated scrapers to run on schedule

---

## Stopping the Application

When you're done using the application:

1. Go to the Terminal window where you ran `pnpm dev`
2. Press `Ctrl + C` (Windows/Mac/Linux)
3. You'll see the server shut down
4. The application will no longer be accessible at `http://localhost:3000`

To start it again later, just run `pnpm dev` again!

---

## Common Problems and Solutions

### Problem: "Port 3000 is already in use"

**What it means:** Another program is using port 3000.

**Solution:**
1. Change the port in your `.env` file:
   ```env
   PORT=3001
   ```
2. Restart the application
3. Now go to `http://localhost:3001` instead

### Problem: "Cannot connect to database"

**What it means:** The application can't reach your MySQL database.

**Solutions:**
1. Make sure MySQL is running:
   - **Windows:** Check Services → MySQL should be "Running"
   - **Mac:** Check System Preferences → MySQL → "Running"
2. Double-check your `DATABASE_URL` in `.env`
3. Make sure the password is correct
4. Try connecting to MySQL manually: `mysql -u nc_user -p`

### Problem: "Module not found" errors

**What it means:** Some code libraries are missing.

**Solution:**
1. Delete the `node_modules` folder in your project
2. Run `pnpm install` again
3. Wait for it to finish
4. Try `pnpm dev` again

### Problem: "Command not found: pnpm"

**What it means:** pnpm isn't installed or isn't in your system PATH.

**Solution:**
1. Close and reopen your Terminal/Command Prompt
2. Try the pnpm installation command again:
   ```bash
   npm install -g pnpm
   ```
3. If it still doesn't work, try using `npx pnpm` instead of just `pnpm`

### Problem: Tables aren't created

**What it means:** The database migration didn't run successfully.

**Solution:**
1. Make sure your `DATABASE_URL` is correct in `.env`
2. Run `pnpm db:push` again
3. Check for error messages
4. Make sure your database user has permission to create tables

### Problem: "Authentication error" or can't log in

**What it means:** The OAuth system isn't configured.

**Solution:**
- The application uses Manus OAuth by default, which requires the Manus platform
- For local development without OAuth, you can either:
  1. Leave the OAuth variables empty in `.env` (the app will run in open mode)
  2. Or implement a different authentication system (like email/password)

---

## Understanding the Project Structure

Here's what each folder does (you don't need to memorize this, just for reference):

```
nc-tax-deed-scraper/
├── client/                    # Frontend (what you see in the browser)
│   ├── src/
│   │   ├── pages/            # Different pages (Home, Properties, Favorites, etc.)
│   │   ├── components/       # Reusable UI pieces (buttons, cards, etc.)
│   │   └── lib/              # Helper code
│   └── public/               # Images, logos, etc.
├── server/                    # Backend (handles data, database, etc.)
│   ├── _core/                # Core server code (don't modify unless you know what you're doing)
│   ├── routers.ts            # API endpoints (how frontend talks to backend)
│   ├── db.ts                 # Database functions
│   └── services/             # Business logic
├── drizzle/                   # Database structure
│   └── schema.ts             # Table definitions
├── scrapers/                  # County website scrapers
├── .env                       # Your configuration (YOU CREATE THIS)
├── package.json               # List of dependencies
└── LOCAL_SETUP.md            # This file!
```

---

## Useful Commands Reference

Here are the commands you'll use most often:

| Command | What It Does |
|---------|--------------|
| `pnpm install` | Install all dependencies (run this first!) |
| `pnpm dev` | Start the development server |
| `pnpm db:push` | Create/update database tables |
| `pnpm build` | Build for production (creates optimized files) |
| `pnpm start` | Run the production build |

---

## Next Steps

Now that you have the application running locally, here are some things you can do:

### 1. Customize the Branding
- Change `VITE_APP_TITLE` in `.env` to your company name
- Replace `/logo.png` in the `client/public/` folder with your logo

### 2. Set Up Automated Scrapers
- Go to the Admin Panel in the application
- Configure which counties to scrape
- Set up a schedule (daily, weekly, etc.)

### 3. Invite Team Members
- If you set up OAuth, team members can create accounts
- Or share the `http://localhost:3000` URL with people on your local network

### 4. Deploy to Production
- When you're ready to make it accessible from anywhere (not just your computer), see `DEPLOYMENT.md` for instructions on deploying to Railway

---

## Getting Help

If you run into problems:

1. **Check the error message** - Read it carefully, it often tells you what's wrong
2. **Check this guide** - Look in the "Common Problems" section
3. **Check the Terminal output** - Error messages appear in the Terminal where you ran `pnpm dev`
4. **Google the error** - Copy the error message and search for it online
5. **Ask for help** - Contact your technical support or the person who set this up for you

---

## Security Notes

**Important things to remember:**

1. **Never share your `.env` file** - It contains passwords and secret keys
2. **Don't commit `.env` to Git** - It's already in `.gitignore`, but double-check
3. **Use strong passwords** - For your database and `JWT_SECRET`
4. **Keep Node.js updated** - Run `node --version` periodically and update if needed
5. **Backup your database** - Export your data regularly in case something goes wrong

---

## Differences from Manus Platform

When running locally vs. on Manus, here are the key differences:

| Feature | On Manus | Running Locally |
|---------|----------|-----------------|
| **Access** | From anywhere with internet | Only from your computer (or local network) |
| **Database** | Managed by Manus | You manage it yourself |
| **Updates** | Automatic | You run `git pull` and redeploy |
| **Backups** | Automatic | You need to set up backups |
| **Cost** | Manus subscription | Free (except database hosting if using cloud) |
| **Maintenance** | Handled by Manus | You handle it |

---

## Conclusion

Congratulations! You've successfully set up the NC Tax Deed Property Tracker on your local computer. You can now:

- Browse and search properties
- Add favorites
- View statistics
- Run scrapers to collect new data
- Customize the application to your needs

Remember:
- Keep the Terminal window open while using the application
- Run `pnpm dev` each time you want to start the application
- Press `Ctrl + C` to stop it when you're done

If you want to make the application accessible from anywhere (not just your computer), check out the `DEPLOYMENT.md` file for instructions on deploying to a cloud platform like Railway.

---

**Document Version:** 1.0  
**Last Updated:** November 6, 2025  
**Author:** Manus AI

**Questions?** Keep this guide handy and refer to the "Common Problems" section if you encounter issues.
