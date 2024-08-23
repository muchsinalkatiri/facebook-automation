const like = require('./like');
const fs = require("fs");


async function buatPosting(page) {
    const path = `./random/posting.json`;
    const posting = JSON.parse(fs.readFileSync(path));
    const randomIndex = Math.floor(Math.random() * posting.length);

    try {

        await page.click(`div[role="button"] span[style="-webkit-box-orient:vertical;-webkit-line-clamp:2;display:-webkit-box"]`);
        await page.waitForTimeout(3000); //delay 2 detik

        await page.click(`div[aria-label^="Edit privasi"]`);
        await page.waitForTimeout(2000); //delay 2 detik
        const radio = await page.$$('div[role="radiogroup"] div[role="radio"]');
        await radio[0].click();
        await page.waitForTimeout(2000); //delay 2 detik
        await page.click(`div[aria-label="Selesai"]`);
        await page.waitForTimeout(3000); //delay 2 detik
        await page.click(`div[role="presentation"]  p`);
        await page.waitForTimeout(2000); //delay 2 detik

        // console.log(posting[randomIndex]);
        await page.keyboard.type(posting[randomIndex]);
        await page.waitForTimeout(5000); //delay 2 detik
        const submitButton = 'input[type="submit"]';
        await page.waitForSelector(submitButton);
        await page.evaluate((selector) => {
            document.querySelector(selector).click();
        }, submitButton);

        await page.waitForTimeout(1000); //delay 2 detik
    } catch (e) {
        console.log(e.message)
    }


    await like(page);
}

// Export fungsi agar bisa diakses dari file lain
module.exports = buatPosting;