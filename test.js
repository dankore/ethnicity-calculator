const puppeteer = require('puppeteer');

async function runTest() {
  const browser = await puppeteer.launch({
    headless: true, // Running headless for CI environment
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });

  // Assuming you have the appropriate form interactions here
  await page.type('#mother input[name="mother_ethnicities1"]', 'Igbo');
  await page.type('#mother input[name="mother_percent1"]', '60');
  await page.type('#father input[name="father_ethnicities1"]', 'Yoruba');
  await page.type('#father input[name="father_percent1"]', '40');
  
  await page.click('#calculate');

  await page.waitForSelector('#result', { visible: true });
  const resultText = await page.evaluate(() => document.querySelector('#result').textContent);
  console.log('Test Result:', resultText);

  await browser.close();
}

runTest().catch(error => {
  console.error('Test failed', error);
  process.exit(1);
});
