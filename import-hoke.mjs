import { ScraperService } from './server/scraperService.ts';

async function importHoke() {
  try {
    console.log('Importing Hoke County properties...\n');
    
    const service = new ScraperService();
    const result = await service.runScraper('hoke');
    
    console.log('\n✅ Import complete!');
    console.log(`Success: ${result.success}`);
    console.log(`Properties processed: ${result.count}`);
    if (result.error) {
      console.log(`Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importHoke();
