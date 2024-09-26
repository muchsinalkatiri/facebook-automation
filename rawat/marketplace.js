const scroll = require('./scroll');
const fs = require("fs");

async function marketplace(page) {
    const kata_kunci = JSON.parse(fs.readFileSync(`./random/kataKunciMp.json`));
    let kk = kata_kunci[Math.floor(Math.random() * kata_kunci.length)];
    try {
        await page.click(
            `a[href="${page.url()}marketplace/?ref=bookmark"]`
        );
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(10000);
    } catch (e) {
        await page.goto(`${page.url()}marketplace/?ref=bookmark`, {
            waitUntil: ["load"],
            timeout: 50000,
        });
        console.log(e.message)
    }

    const search = await page.$$('input[aria-label="Telusuri Marketplace"]');
    try {
        await search[0].click();
        await search[0].type(kk);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(10000);
    } catch (e) {}


    try {
        const listKota = JSON.parse(fs.readFileSync(`./random/kota.json`));
        const kota = listKota[Math.floor(Math.random() * listKota.length)];
        await page.click('div#seo_filters div[role="button"] div[class="x78zum5 xl56j7k x1y1aw1k x1sxyh0 xwib8y2 xurb0ha"]');
        await page.waitForTimeout(5000);

        await page.type('input[aria-label="Lokasi"]', kota)
        await page.waitForTimeout(5000);

        const lokasi = await page.$$('ul[role="listbox"] li');
        await lokasi[0].click();
        await page.waitForTimeout(5000);

        const terapkanBtn = await page.$x(`//span[text()='Terapkan']`);
        await terapkanBtn[0].click();
        await page.waitForTimeout(5000);
    } catch (e) {}

    await page.waitForTimeout(10000);
    await scroll(page, {
        count: 3,
        size: 200
    });

    const produk = await page.$$('div[style="max-width: 381px; min-width: 242px;"] a[role="link"][tabindex="0"] img[referrerpolicy="origin-when-cross-origin"]');
    const randomIndex = Math.floor(Math.random() * 18);

    try {
        await produk[randomIndex].click();
        await page.waitForTimeout(10000);
        await page.click('div[aria-label="Simpan"]');
        await page.waitForTimeout(5000);
        await page.click('div[aria-label^="Bagikan"]');
        await page.waitForTimeout(5000);
        const buttons = await page.$x(`//span[text()='Bagikan sekarang']`);
        await buttons[0].click();
        // await page.waitForTimeout(5000);
        // await page.click('div[aria-label="Bagikan Tawaran"]');
        // await page.waitForTimeout(5000);
    } catch (e) {
        console.log(e.message)

    }

}

// Export fungsi agar bisa diakses dari file lain
module.exports = marketplace;