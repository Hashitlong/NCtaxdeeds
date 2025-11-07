import { ScraperService } from './server/scraperService.ts';

async function importPDFCounties() {
  try {
    const service = new ScraperService();
    
    console.log('Importing Anson County properties...\n');
    const ansonResult = await service.runScraper('anson');
    console.log(`Anson: ${ansonResult.success ? '✅' : '❌'} - ${ansonResult.count} properties\n`);
    
    console.log('Importing Bladen County properties...\n');
    const bladenResult = await service.runScraper('bladen');
    console.log(`Bladen: ${bladenResult.success ? '✅' : '❌'} - ${bladenResult.count} properties\n`);
    
    const total = ansonResult.count + bladenResult.count;
    console.log(`\n✅ Import complete! Total: ${total} properties`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importPDFCounties();
