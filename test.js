const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: true, // Ensure it runs headless
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necessary for CI environments
    });
    const page = await browser.newPage();
    await page.goto(`file://${__dirname}/index.html`, { waitUntil: 'networkidle0' });

    // Test theme change: Switch to dark theme and check a style change
    console.log('Testing theme change...');
    await page.click('.toggle-btn[data-theme="dark"]');
    const backgroundColorDark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log(`Dark theme background color: ${backgroundColorDark}`); // Log the color to verify

    // Switch to light theme and verify change
    await page.click('.toggle-btn[data-theme="light"]');
    const backgroundColorLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log(`Light theme background color: ${backgroundColorLight}`); // Log the color to verify

    // Test form submission
    console.log('Testing form submission...');
    await page.type('input[name="mother_ethnicities1"]', 'Hausa');
    await page.type('input[name="mother_percent1"]', '50');
    await page.type('input[name="father_ethnicities1"]', 'Fulani');
    await page.type('input[name="father_percent1"]', '50');
    await page.click('#calculate');
    await page.waitForSelector('#result', { visible: true });
    const resultText = await page.evaluate(() => document.getElementById('result').innerText);
    console.log(`Result Displayed: ${resultText}`); // Log result to verify

    // Close the browser
    await browser.close();
})();
