import puppeteer from 'puppeteer';
import fs from 'fs';

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
    // Wait longer for dropdown to fully render
    console.log('Waiting 5 seconds for dropdown to render...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Inspect ALL elements inside dxbl-dropdown
    const dropdownContent = await page.evaluate(() => {
      const dropdown = document.querySelector('dxbl-dropdown');
      if (!dropdown) return { found: false };
      
      return {
        found: true,
        html: dropdown.innerHTML,
        allDescendants: Array.from(dropdown.querySelectorAll('*')).map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 50),
          className: el.className,
          role: el.getAttribute('role'),
          clickable: el.tagName === 'DIV' || el.tagName === 'LI' || el.tagName === 'A' || el.tagName === 'BUTTON'
        })).filter(el => el.text && el.text.length > 0)
      };
    });
    
    console.log('\n=== DROPDOWN CONTENT ===');
    if (dropdownContent.found) {
      console.log('Dropdown HTML length:', dropdownContent.html.length);
      console.log('\nAll elements with text inside dropdown:');
      console.log(JSON.stringify(dropdownContent.allDescendants, null, 2));
      
      // Save HTML to file
      fs.writeFileSync('/home/ubuntu/zls-dropdown-content.html', dropdownContent.html);
      console.log('\n✅ Dropdown HTML saved to /home/ubuntu/zls-dropdown-content.html');
    } else {
      console.log('Dropdown element not found!');
    }
    
    // Take screenshot
    await page.screenshot({ path: '/home/ubuntu/zls-dropdown-open2.png', fullPage: true });
    console.log('✅ Full page screenshot saved to /home/ubuntu/zls-dropdown-open2.png');
  }
  
} catch (error) {
  console.error('Error:', error);
} finally {
  await browser.close();
}
