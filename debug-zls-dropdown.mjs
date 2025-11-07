import puppeteer from 'puppeteer';

console.log('Launching browser to inspect ZLS dropdown options...');

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
  const clicked = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const pageSizeLabel = labels.find(l => l.textContent?.includes('Page Size'));
    
    if (!pageSizeLabel) return { success: false, reason: 'Label not found' };
    
    const comboBox = pageSizeLabel.parentElement?.querySelector('dxbl-combo-box');
    if (!comboBox) return { success: false, reason: 'ComboBox not found' };
    
    const dropdownButton = comboBox.querySelector('button[aria-label*="drop-down"]');
    if (!dropdownButton) return { success: false, reason: 'Button not found' };
    
    dropdownButton.click();
    return { success: true };
  });
  
  console.log('Dropdown click result:', clicked);
  
  if (clicked.success) {
    // Wait for dropdown to fully render
    console.log('Waiting for dropdown to render...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({ path: '/home/ubuntu/zls-dropdown-open.png' });
    console.log('✅ Screenshot saved to /home/ubuntu/zls-dropdown-open.png');
    
    // Inspect dropdown options
    const dropdownInfo = await page.evaluate(() => {
      // Try various selectors for dropdown options
      const results = {
        roleOption: Array.from(document.querySelectorAll('[role="option"]')).map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          tag: el.tagName
        })),
        roleListitem: Array.from(document.querySelectorAll('[role="listitem"]')).map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          tag: el.tagName
        })),
        dxblListbox: Array.from(document.querySelectorAll('.dxbl-listbox-item')).map(el => ({
          text: el.textContent?.trim(),
          className: el.className,
          tag: el.tagName
        })),
        dxblDropdown: Array.from(document.querySelectorAll('[class*="dxbl-dropdown"], [class*="dxbl-popup"]')).map(el => ({
          text: el.textContent?.substring(0, 200),
          className: el.className,
          tag: el.tagName,
          visible: el.offsetParent !== null
        })),
        allDxbl: Array.from(document.querySelectorAll('[class*="dxbl"]')).filter(el => 
          el.textContent?.includes('All') || el.textContent?.includes('10') || el.textContent?.includes('20')
        ).map(el => ({
          text: el.textContent?.trim().substring(0, 100),
          className: el.className,
          tag: el.tagName
        }))
      };
      
      return results;
    });
    
    console.log('\n=== DROPDOWN OPTIONS ===');
    console.log('role="option" elements:', JSON.stringify(dropdownInfo.roleOption, null, 2));
    console.log('\nrole="listitem" elements:', JSON.stringify(dropdownInfo.roleListitem, null, 2));
    console.log('\n.dxbl-listbox-item elements:', JSON.stringify(dropdownInfo.dxblListbox, null, 2));
    console.log('\nDropdown containers:', JSON.stringify(dropdownInfo.dxblDropdown, null, 2));
    console.log('\nAll dxbl elements with numbers:', JSON.stringify(dropdownInfo.allDxbl, null, 2));
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await browser.close();
}
