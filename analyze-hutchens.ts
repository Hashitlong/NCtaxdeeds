import { scrapeHutchens } from './scrapers/hutchens_scraper';

async function analyzeHutchens() {
  console.log('Running Hutchens scraper analysis...\n');
  
  try {
    const properties = await scrapeHutchens();
    
    // Count properties by county
    const countyCount: Record<string, number> = {};
    properties.forEach(prop => {
      const county = prop.county;
      countyCount[county] = (countyCount[county] || 0) + 1;
    });
    
    // Sort counties by property count
    const sortedCounties = Object.entries(countyCount)
      .sort((a, b) => b[1] - a[1]);
    
    console.log('=== HUTCHENS LAW FIRM COVERAGE ===\n');
    console.log(`Total Properties: ${properties.length}`);
    console.log(`Total Counties: ${sortedCounties.length}\n`);
    
    console.log('Counties and Property Counts:');
    console.log('─'.repeat(50));
    sortedCounties.forEach(([county, count]) => {
      console.log(`${county.padEnd(30)} ${count.toString().padStart(3)} properties`);
    });
    
    console.log('\n' + '─'.repeat(50));
    console.log('\nCounty List (alphabetical):');
    const alphabetical = sortedCounties
      .map(([county]) => county)
      .sort();
    console.log(alphabetical.join(', '));
    
  } catch (error) {
    console.error('Error analyzing Hutchens scraper:', error);
    process.exit(1);
  }
}

analyzeHutchens();
