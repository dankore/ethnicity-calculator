const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${__dirname}/index.html`, { waitUntil: 'networkidle0' });

  // Perform any necessary checks or interactions with the page here

  await browser.close();
})();
