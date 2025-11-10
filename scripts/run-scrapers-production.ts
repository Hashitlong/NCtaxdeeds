#!/usr/bin/env tsx
/**
 * Run scrapers on production Railway database
 * This script is designed to be run from within Railway environment
 */

import 'dotenv/config';
import { ScraperService } from '../server/scraperService';

async function main() {
  console.log('='.repeat(60));
  console.log('Running Scrapers on Production');
  console.log('='.repeat(60));
  console.log('');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('This script must be run in Railway environment or with DATABASE_URL set');
    process.exit(1);
  }

  const service = new ScraperService();
  
  console.log('Starting all scrapers...\n');
  const startTime = Date.now();
  
  const result = await service.runScraper('all');
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('SCRAPING COMPLETE');
  console.log('='.repeat(60));
  console.log(`Duration: ${duration}s`);
  console.log(`Success: ${result.success ? '✅' : '❌'}`);
  console.log(`Properties scraped: ${result.count}`);
  if (result.error) {
    console.log(`Error: ${result.error}`);
  }
  console.log('='.repeat(60));
  
  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});