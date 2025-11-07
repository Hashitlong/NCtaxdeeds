import puppeteer from 'puppeteer';

console.log('Testing ZLS notice extraction...');

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
  
  console.log('Table loaded, clicking first Notice button...');
  
  // Click the first Notice button
  const noticeClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const noticeBtn = buttons.find(btn => btn.textContent?.trim() === 'Notice');
    if (noticeBtn) {
      noticeBtn.click();
      return true;
    }
    return false;
  });
  
  if (!noticeClicked) {
    console.log('Could not find Notice button');
    process.exit(1);
  }
  
  console.log('Waiting for modal to open...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract notice text
  const noticeData = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return { found: false };
    
    return {
      found: true,
      text: textarea.value,
      length: textarea.value.length
    };
  });
  
  if (noticeData.found) {
    console.log('\n=== NOTICE TEXT ===');
    console.log('Length:', noticeData.length, 'characters');
    console.log('\nFull text:');
    console.log(noticeData.text);
  } else {
    console.log('Could not find textarea with notice text');
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await browser.close();
}
