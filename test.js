const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false }); // headless: false for visual debugging
    const page = await browser.newPage();
    await page.goto(`file://${__dirname}/index.html`, { waitUntil: 'networkidle0' });

    // Test theme toggle buttons
    console.log('Testing theme toggling...');
    await page.click('.toggle-btn[data-theme="dark"]');
    await page.waitForFunction(
        () => window.getComputedStyle(document.body).backgroundColor === 'rgb(18, 18, 18)', // Adjust according to actual CSS
        { timeout: 2000 }
    );
    console.log('Dark theme applied correctly');

    await page.click('.toggle-btn[data-theme="light"]');
    await page.waitForFunction(
        () => window.getComputedStyle(document.body).backgroundColor === 'rgb(255, 255, 255)', // Adjust according to actual CSS
        { timeout: 2000 }
    );
    console.log('Light theme applied correctly');

    // Test form submission
    console.log('Testing form submission...');
    await page.type('input[name="mother_ethnicities1"]', 'Hausa');
    await page.type('input[name="mother_percent1"]', '50');
    await page.type('input[name="father_ethnicities1"]', 'Fulani');
    await page.type('input[name="father_percent1"]', '50');
    await page.click('#calculate');
    await page.waitForSelector('#result:visible', { timeout: 2000 });
    console.log('Result displayed after form submission');

    // Check responsive menu toggle on small screens
    console.log('Testing responsive navigation menu...');
    await page.setViewport({ width: 480, height: 720 });
    await page.waitForSelector('.menu-toggle', { visible: true });
    await page.click('.menu-toggle'); // Toggles the menu
    await page.waitForSelector('.nav-links', { visible: true });
    console.log('Responsive menu toggled successfully');

    // Close the browser session
    await browser.close();
})();
