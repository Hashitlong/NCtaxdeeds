import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://catawbacountync.gov/county-services/tax/online-search/search-foreclosure-sales/', {
    waitUntil: 'networkidle2',
    timeout: 60000,
  });

  // Get the HTML of the table section
  const tableHTML = await page.evaluate(() => {
    const tables = document.querySelectorAll('table');
    const results: string[] = [];
    
    tables.forEach((table, index) => {
      results.push(`\n=== TABLE ${index} ===`);
      results.push(table.outerHTML.substring(0, 2000)); // First 2000 chars
    });
    
    return results.join('\n');
  });

  console.log('Table HTML:', tableHTML);

  // Also check for any divs or sections that might contain the data
  const dataContainers = await page.evaluate(() => {
    const text = document.body.innerText;
    // Look for the property data we know exists
    if (text.includes('1853 1st Ave SW')) {
      return 'Found property data in page text';
    }
    return 'Property data not found in page text';
  });

  console.log('\nData check:', dataContainers);

  await browser.close();
})();
