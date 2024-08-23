const like = require('./like');
const scroll = require('./scroll');
const fs = require("fs");



async function searchTeman(page) {
    const path = `./random/nama.json`;
    const nama = JSON.parse(fs.readFileSync(path));
    const randomIndex = Math.floor(Math.random() * nama.length);

    try {
        const search = await page.$$('input[aria-label="Cari di Facebook"]');
        await search[0].click();
        await search[0].type(nama[randomIndex]);
        await page.keyboard.press('Enter');

        await page.waitForTimeout(2000);

        await page.click('a[href^="/search/people/"][role="link"]');
        await page.waitForTimeout(1000);

        const tambah = await page.$x(`//span[text()='Tambah teman']`);
        const r = Math.floor(Math.random() * tambah.length);

        await tambah[r].click();
        await page.waitForTimeout(2000);
    } catch (e) {}


    await page.goto("https://facebook.com/", {
        waitUntil: ["load"],
        timeout: 50000,
    });
    await like(page);
}

// Export fungsi agar bisa diakses dari file lain
module.exports = searchTeman;