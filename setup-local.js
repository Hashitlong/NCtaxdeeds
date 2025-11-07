#!/usr/bin/env node

/**
 * NC Tax Deed Property Tracker - Local Setup Helper
 * 
 * This script helps you set up the project for local development
 * by creating a .env file with the necessary configuration.
 * 
 * Usage: node setup-local.js
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function generateRandomSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

console.log('\n==============================================');
console.log('NC Tax Deed Property Tracker - Setup Helper');
console.log('==============================================\n');
console.log('This script will help you create a .env file for local development.');
console.log('Press Ctrl+C at any time to cancel.\n');

async function main() {
  const envPath = path.join(__dirname, '.env');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await question('.env file already exists. Overwrite it? (yes/no): ');
    if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Your existing .env file was not modified.');
      rl.close();
      return;
    }
  }

  console.log('\n--- Database Configuration ---\n');
  console.log('Choose your database option:');
  console.log('1. Local MySQL (running on your computer)');
  console.log('2. TiDB Cloud (cloud-hosted database)');
  console.log('3. Custom connection string\n');
  
  const dbChoice = await question('Enter your choice (1, 2, or 3): ');
  let databaseUrl = '';

  if (dbChoice === '1') {
    console.log('\nFor local MySQL, you need:');
    console.log('- Database name (e.g., nc_tax_deed_tracker)');
    console.log('- Username (e.g., nc_user)');
    console.log('- Password\n');
    
    const dbName = await question('Database name [nc_tax_deed_tracker]: ') || 'nc_tax_deed_tracker';
    const dbUser = await question('Database username [nc_user]: ') || 'nc_user';
    const dbPass = await question('Database password: ');
    const dbHost = await question('Database host [localhost]: ') || 'localhost';
    const dbPort = await question('Database port [3306]: ') || '3306';
    
    databaseUrl = `mysql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;
  } else if (dbChoice === '2') {
    console.log('\nPaste your TiDB Cloud connection string below.');
    console.log('You can find this in your TiDB Cloud dashboard under "Connect".\n');
    databaseUrl = await question('TiDB connection string: ');
  } else {
    console.log('\nEnter your custom MySQL connection string.');
    console.log('Format: mysql://username:password@host:port/database\n');
    databaseUrl = await question('Connection string: ');
  }

  console.log('\n--- Owner/Admin Configuration ---\n');
  console.log('The owner gets admin access to the application.\n');
  
  const ownerEmail = await question('Your email address: ');
  const ownerName = await question('Your full name: ');

  console.log('\n--- Security Configuration ---\n');
  console.log('Generating a random JWT secret for session security...');
  const jwtSecret = generateRandomSecret();
  console.log('✓ JWT secret generated\n');

  console.log('\n--- Application Settings ---\n');
  const appTitle = await question('Application title [NC Tax Deed Property Tracker]: ') || 'NC Tax Deed Property Tracker';
  const port = await question('Server port [3000]: ') || '3000';

  console.log('\n--- OAuth Configuration (Optional) ---\n');
  console.log('If you\'re using Manus OAuth, enter your credentials.');
  console.log('Otherwise, just press Enter to skip.\n');
  
  const useOAuth = await question('Use Manus OAuth? (yes/no) [no]: ');
  let oauthConfig = {
    appId: '',
    serverUrl: '',
    portalUrl: ''
  };

  if (useOAuth.toLowerCase() === 'yes' || useOAuth.toLowerCase() === 'y') {
    oauthConfig.appId = await question('Manus App ID: ');
    oauthConfig.serverUrl = await question('OAuth Server URL [https://api.manus.im]: ') || 'https://api.manus.im';
    oauthConfig.portalUrl = await question('OAuth Portal URL [https://portal.manus.im]: ') || 'https://portal.manus.im';
  }

  // Create .env content
  const envContent = `# NC Tax Deed Property Tracker - Environment Configuration
# Generated on ${new Date().toISOString()}
# DO NOT commit this file to version control!

# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL="${databaseUrl}"

# ============================================
# APPLICATION SETTINGS
# ============================================
NODE_ENV="development"
PORT=${port}

# ============================================
# SECURITY
# ============================================
JWT_SECRET="${jwtSecret}"

# ============================================
# OWNER/ADMIN CONFIGURATION
# ============================================
OWNER_OPEN_ID="${ownerEmail}"
OWNER_NAME="${ownerName}"

# ============================================
# APPLICATION BRANDING
# ============================================
VITE_APP_TITLE="${appTitle}"
VITE_APP_LOGO="/logo.png"

# ============================================
# OAUTH CONFIGURATION
# ============================================
VITE_APP_ID="${oauthConfig.appId}"
OAUTH_SERVER_URL="${oauthConfig.serverUrl}"
VITE_OAUTH_PORTAL_URL="${oauthConfig.portalUrl}"

# ============================================
# BUILT-IN SERVICES (Manus Platform Features)
# ============================================
# Leave these empty if running outside of Manus
BUILT_IN_FORGE_API_URL=""
BUILT_IN_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_URL=""

# ============================================
# ANALYTICS
# ============================================
VITE_ANALYTICS_WEBSITE_ID=""
VITE_ANALYTICS_ENDPOINT=""
`;

  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n==============================================');
  console.log('✓ Setup Complete!');
  console.log('==============================================\n');
  console.log('Your .env file has been created successfully.');
  console.log('\nNext steps:');
  console.log('1. Run: pnpm install');
  console.log('2. Run: pnpm db:push (to create database tables)');
  console.log('3. Run: pnpm dev (to start the development server)');
  console.log('4. Open: http://localhost:' + port + '\n');
  console.log('For detailed instructions, see LOCAL_SETUP.md\n');
  
  rl.close();
}

main().catch(error => {
  console.error('\nError:', error.message);
  rl.close();
  process.exit(1);
});
