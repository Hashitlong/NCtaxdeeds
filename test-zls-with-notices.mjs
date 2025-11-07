import { scrapeZLS } from './scrapers/zls_scraper.ts';

console.log('Testing ZLS scraper with notice extraction (10 properties)...\n');

try {
  const properties = await scrapeZLS({ 
    extractNotices: true, 
    maxNotices: 10 
  });
  
  console.log(`\n✅ Scraping complete! Found ${properties.length} total properties\n`);
  
  // Count properties with notice details
  const withNotices = properties.filter(p => p.noticeText).length;
  console.log(`📊 Properties with notice details: ${withNotices}/${properties.length}`);
  
  // Show first property with full details
  const sampleWithNotice = properties.find(p => p.noticeText);
  
  if (sampleWithNotice) {
    console.log('\n=== SAMPLE PROPERTY WITH FULL DETAILS ===');
    console.log(JSON.stringify({
      county: sampleWithNotice.county,
      parcelId: sampleWithNotice.parcelId,
      address: sampleWithNotice.address,
      saleDate: sampleWithNotice.saleDate,
      saleStatus: sampleWithNotice.saleStatus,
      currentBid: sampleWithNotice.currentBid,
      owner: sampleWithNotice.owner,
      caseNumber: sampleWithNotice.caseNumber,
      deedBookPage: sampleWithNotice.deedBookPage,
      depositRequired: sampleWithNotice.depositRequired,
      legalDescription: sampleWithNotice.legalDescription?.substring(0, 200) + '...',
      noticeTextLength: sampleWithNotice.noticeText?.length
    }, null, 2));
  }
  
  console.log('\n✅ Test complete!');
  
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
