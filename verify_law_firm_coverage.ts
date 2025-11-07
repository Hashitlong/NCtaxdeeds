import { scrapeKania } from './scrapers/kania_scraper';
import { scrapeZLS } from './scrapers/zls_scraper';

async function verify() {
  console.log('=== VERIFYING LAW FIRM COVERAGE ===\n');
  
  // Check Kania
  console.log('1. Checking Kania Law Firm...');
  const kaniaProps = await scrapeKania();
  const kaniaCounties = [...new Set(kaniaProps.map(p => p.county))].sort();
  console.log(`   Found ${kaniaProps.length} properties across ${kaniaCounties.length} counties`);
  console.log(`   Counties: ${kaniaCounties.join(', ')}\n`);
  
  // Check ZLS
  console.log('2. Checking ZLS (Zacchaeus Legal Services)...');
  console.log('   (This takes ~2 minutes to scrape 23 pages)...');
  const zlsProps = await scrapeZLS();
  const zlsCounties = [...new Set(zlsProps.map(p => p.county))].sort();
  console.log(`   Found ${zlsProps.length} properties across ${zlsCounties.length} counties`);
  console.log(`   Counties: ${zlsCounties.join(', ')}\n`);
  
  // Combined coverage
  const allCounties = [...new Set([...kaniaCounties, ...zlsCounties])].sort();
  console.log('=== SUMMARY ===');
  console.log(`Kania: ${kaniaCounties.length} counties, ${kaniaProps.length} properties`);
  console.log(`ZLS: ${zlsCounties.length} counties, ${zlsProps.length} properties`);
  console.log(`Combined: ${allCounties.length} unique counties`);
  console.log(`\nAll counties covered by law firms:`);
  allCounties.forEach((c, i) => console.log(`${i + 1}. ${c}`));
}

verify().catch(console.error);
