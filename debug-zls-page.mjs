import puppeteer from 'puppeteer';
import fs from 'fs';

console.log('Launching browser to inspect ZLS page structure...');

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

  console.log('Waiting for Blazor to initialize...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Wait for disclaimer and click I AGREE
  await page.waitForFunction(
    () => document.body.textContent?.includes('I AGREE'),
    { timeout: 30000 }
  );
  
  console.log('Clicking I AGREE...');
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a, button'));
    const agreeLink = links.find(el => el.textContent?.trim() === 'I AGREE');
    if (agreeLink && agreeLink instanceof HTMLElement) {
      agreeLink.click();
    }
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  await page.waitForSelector('table', { timeout: 30000 });
  
  console.log('Table loaded, inspecting page structure...');
  
  // Find pagination container
  const paginationInfo = await page.evaluate(() => {
    // Find element containing "of 23"
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    let container = null;
    while (node = walker.nextNode()) {
      if (node.textContent.includes('of 23')) {
        container = node.parentElement;
        break;
      }
    }
    
    if (container) {
      return {
        found: true,
        html: container.parentElement?.parentElement?.innerHTML || container.parentElement?.innerHTML || container.innerHTML,
        selects: document.querySelectorAll('select').length,
        allText: container.parentElement?.parentElement?.textContent || ''
      };
    }
    
    return { found: false };
  });
  
  console.log('\n=== PAGINATION INFO ===');
  console.log('Found:', paginationInfo.found);
  console.log('Select elements:', paginationInfo.selects);
  console.log('\nText content:', paginationInfo.allText?.substring(0, 500));
  console.log('\n=== HTML STRUCTURE ===');
  console.log(paginationInfo.html?.substring(0, 2000));
  
  // Save full HTML to file
  const fullHTML = await page.content();
  fs.writeFileSync('/home/ubuntu/zls-page-debug.html', fullHTML);
  console.log('\n✅ Full HTML saved to /home/ubuntu/zls-page-debug.html');
  
  // Take screenshot
  await page.screenshot({ path: '/home/ubuntu/zls-page-debug.png', fullPage: true });
  console.log('✅ Screenshot saved to /home/ubuntu/zls-page-debug.png');
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await browser.close();
}
