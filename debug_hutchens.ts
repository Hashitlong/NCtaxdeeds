import puppeteer from 'puppeteer';

async function debugHutchens() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://sales.hutchenslawfirm.com/NCfcSalesList.aspx', {
    waitUntil: 'networkidle2',
    timeout: 60000
  });

  await page.waitForSelector('table', { timeout: 10000 });

  // Get table headers
  const headers = await page.evaluate(() => {
    const headerRow = document.querySelector('table tr');
    if (!headerRow) return [];
    const cells = headerRow.querySelectorAll('th, td');
    return Array.from(cells).map((cell, idx) => ({
      index: idx,
      text: cell.textContent?.trim() || ''
    }));
  });

  console.log('Table Headers:');
  headers.forEach(h => console.log(`  Column ${h.index}: "${h.text}"`));

  // Get first data row
  const firstRow = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tr');
    if (rows.length < 2) return [];
    const cells = rows[1].querySelectorAll('td');
    return Array.from(cells).map((cell, idx) => ({
      index: idx,
      text: cell.textContent?.trim() || ''
    }));
  });

  console.log('\nFirst Data Row:');
  firstRow.forEach(cell => console.log(`  Column ${cell.index}: "${cell.text}"`));

  await browser.close();
}

debugHutchens().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
