#!/usr/bin/env node
/**
 * Daily Automated Scraping Script
 * Runs all scrapers via internal cron endpoint
 * Designed to be run via cron job daily
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CRON_SECRET = process.env.CRON_SECRET || 'internal-cron-secret-2024';

async function runDailyScrape() {
  console.log(`[${new Date().toISOString()}] Starting daily scrape...`);
  
  try {
    // Call the internal cron endpoint
    const response = await fetch(`${API_URL}/api/internal/cron/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': CRON_SECRET,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log(`[${new Date().toISOString()}] Daily scrape completed successfully`);
    console.log(`Properties imported: ${result.count}`);
    if (result.error) {
      console.log(`Note: ${result.error}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Daily scrape failed:`, error);
    process.exit(1);
  }
}

runDailyScrape();
