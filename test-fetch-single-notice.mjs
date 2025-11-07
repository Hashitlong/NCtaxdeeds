import { fetchZLSNotice } from './scrapers/zls_notice_fetcher.ts';

console.log('Testing on-demand notice fetching...\n');

// Test with a known parcel ID from our earlier tests
const testParcelId = '00009346';
const testCounty = 'Moore';

console.log(`Fetching notice for parcel ${testParcelId} in ${testCounty} County...`);
console.log('This may take 30-60 seconds as it searches through pages...\n');

try {
  const result = await fetchZLSNotice(testParcelId, testCounty);
  
  if (result.success && result.details) {
    console.log('✅ SUCCESS! Notice fetched successfully\n');
    console.log('=== NOTICE DETAILS ===');
    console.log('Owner:', result.details.owner);
    console.log('Case Number:', result.details.caseNumber);
    console.log('Deed Book/Page:', result.details.deedBookPage);
    console.log('Deposit Required:', result.details.depositRequired);
    console.log('Legal Description:', result.details.legalDescription?.substring(0, 200) + '...');
    console.log('Notice Text Length:', result.details.noticeText.length, 'characters');
  } else {
    console.log('❌ FAILED:', result.error);
  }
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
