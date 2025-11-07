import puppeteer from 'puppeteer';
import fs from 'fs';

console.log('Launching browser to inspect ZLS popup portal...');

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
  
  console.log('Table loaded, clicking page size dropdown...');
  
  // Click dropdown button
  await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const pageSizeLabel = labels.find(l => l.textContent?.includes('Page Size'));
    const comboBox = pageSizeLabel?.parentElement?.querySelector('dxbl-combo-box');
    const dropdownButton = comboBox?.querySelector('button[aria-label*="drop-down"]');
    dropdownButton?.click();
  });
  
  console.log('Waiting 5 seconds for portal content to render...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Inspect ALL popup portals
  const portalContent = await page.evaluate(() => {
    const portals = Array.from(document.querySelectorAll('dxbl-popup-portal'));
    
    return portals.map((portal, index) => {
      const allElements = Array.from(portal.querySelectorAll('*'));
      const textElements = allElements.filter(el => {
        const text = el.textContent?.trim();
        return text && text.length > 0 && text.length < 100;
      });
      
      return {
        index,
        visible: portal.offsetParent !== null || portal.children.length > 0,
        childCount: portal.children.length,
        html: portal.innerHTML.substring(0, 2000),
        textElements: textElements.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          className: el.className,
          role: el.getAttribute('role')
        }))
      };
    });
  });
  
  console.log('\n=== POPUP PORTALS ===');
  console.log(`Found ${portalContent.length} portals`);
  
  portalContent.forEach((portal, i) => {
    console.log(`\n--- Portal ${i} ---`);
    console.log(`Visible: ${portal.visible}, Children: ${portal.childCount}`);
    console.log(`Text elements:`, JSON.stringify(portal.textElements, null, 2));
    if (portal.html.length > 100) {
      console.log(`HTML preview:`, portal.html.substring(0, 500));
    }
  });
  
  // Save full page HTML
  const fullHTML = await page.content();
  fs.writeFileSync('/home/ubuntu/zls-page-with-dropdown.html', fullHTML);
  console.log('\n✅ Full page HTML saved to /home/ubuntu/zls-page-with-dropdown.html');
  
  // Take screenshot
  await page.screenshot({ path: '/home/ubuntu/zls-portal-screenshot.png', fullPage: true });
  console.log('✅ Screenshot saved to /home/ubuntu/zls-portal-screenshot.png');
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await browser.close();
}
