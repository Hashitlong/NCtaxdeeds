import puppeteer from 'puppeteer';
import { parseNoticeText } from './scrapers/zls_notice_extractor.ts';

console.log('Quick test: Extracting notices from first 3 properties...\n');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

try {
  const page = await browser.newPage();
  await page.goto('https://www.zls-nc.com/listings', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  console.log('Waiting for Blazor...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Click I AGREE
  await page.waitForFunction(
    () => document.body.textContent?.includes('I AGREE'),
    { timeout: 30000 }
  );
  
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const agreeLink = links.find(el => el.textContent?.trim() === 'I AGREE');
    if (agreeLink && agreeLink instanceof HTMLElement) {
      agreeLink.click();
    }
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.waitForSelector('table', { timeout: 30000 });
  
  console.log('Table loaded, finding Notice buttons...\n');
  
  // Get first 3 Notice buttons
  const noticeButtons = await page.$$('button');
  const noticeButtonsFiltered = [];
  
  for (const btn of noticeButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text?.trim() === 'Notice') {
      noticeButtonsFiltered.push(btn);
      if (noticeButtonsFiltered.length >= 3) break;
    }
  }
  
  console.log(`Found ${noticeButtonsFiltered.length} Notice buttons\n`);
  
  // Test each one
  for (let i = 0; i < noticeButtonsFiltered.length; i++) {
    console.log(`=== PROPERTY ${i + 1} ===`);
    
    try {
      await noticeButtonsFiltered[i].click();
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const noticeText = await page.evaluate(() => {
        const textarea = document.querySelector('textarea');
        return textarea ? textarea.value : null;
      });
      
      if (noticeText) {
        const details = parseNoticeText(noticeText);
        
        console.log('Owner:', details.owner);
        console.log('Case Number:', details.caseNumber);
        console.log('Deed Book/Page:', details.deedBookPage);
        console.log('Deposit Required:', details.depositRequired);
        console.log('Legal Description:', details.legalDescription?.substring(0, 150) + '...');
        console.log('Notice Length:', noticeText.length, 'characters');
        
        // Extract parcel ID
        const parcelMatch = noticeText.match(/Parcel Identification Number:\s*([\w-]+)/i);
        console.log('Parcel ID:', parcelMatch ? parcelMatch[1] : 'Not found');
      } else {
        console.log('❌ No notice text found');
      }
      
      // Close modal
      const closeButton = await page.$('button[aria-label="Close"]');
      if (closeButton) {
        await closeButton.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('');
    } catch (e) {
      console.log('❌ Error:', e.message);
    }
  }
  
  console.log('✅ Quick test complete!');
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await browser.close();
}
