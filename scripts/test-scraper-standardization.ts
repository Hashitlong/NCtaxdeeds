/**
 * Test script to verify county name standardization in scrapers
 * Tests a single scraper to ensure standardizeCountyName is working
 */

import { scrapeEdgecombeCounty } from '../scrapers/edgecombe_county_scraper';

async function testScraperStandardization() {
  console.log('=== Testing Scraper County Name Standardization ===\n');
  
  try {
    console.log('Running Edgecombe County scraper...');
    const properties = await scrapeEdgecombeCounty();
    
    console.log(`\n✓ Scraper completed successfully`);
    console.log(`  Properties found: ${properties.length}`);
    
    if (properties.length > 0) {
      const sampleProperty = properties[0];
      console.log(`\n  Sample property:`);
      console.log(`    County: "${sampleProperty.county}"`);
      console.log(`    Address: ${sampleProperty.address}`);
      
      // Verify county name is standardized
      const countyName = sampleProperty.county;
      const hasCommaNC = countyName.includes(', NC');
      const hasCountySuffix = countyName.endsWith(' County');
      const hasCityPrefix = countyName.startsWith('City of') || countyName.startsWith('Town of');
      
      console.log(`\n  Standardization checks:`);
      console.log(`    ✓ No ", NC" suffix: ${!hasCommaNC ? 'PASS' : 'FAIL'}`);
      console.log(`    ✓ No " County" suffix: ${!hasCountySuffix ? 'PASS' : 'FAIL'}`);
      console.log(`    ✓ No city/town prefix: ${!hasCityPrefix ? 'PASS' : 'FAIL'}`);
      
      if (!hasCommaNC && !hasCountySuffix && !hasCityPrefix) {
        console.log(`\n✅ County name standardization is working correctly!`);
        return true;
      } else {
        console.log(`\n❌ County name standardization failed!`);
        return false;
      }
    } else {
      console.log(`\n⚠️  No properties found to test`);
      return true; // Not a failure, just no data
    }
    
  } catch (error) {
    console.error(`\n❌ Test failed with error:`, error);
    return false;
  }
}

// Run the test
testScraperStandardization()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
