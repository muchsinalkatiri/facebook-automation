const like = require('./like');
const scroll = require('./scroll');
const fs = require("fs");

async function lihatVideo(page, action) {
    const kata_kunci = JSON.parse(fs.readFileSync(`./random/kataKunciIslami.json`));
    const komenShare = JSON.parse(fs.readFileSync(`./random/komenShare.json`));
    await like(page);
    try {
        await page.click(
            `a[href="${page.url()}watch/"]`
        );
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    } catch (e) {
        await page.goto(`${page.url()}watch/`, {
            waitUntil: ["load"],
            timeout: 50000,
        });
        console.log(e.message)
    }
    await page.waitForTimeout(10000);

    const kk = kata_kunci[Math.floor(Math.random() * kata_kunci.length)];
    const search = await page.$$('input[placeholder="Cari video"]');
    try {
        await search[0].click();
        await search[0].type(kk);
        await page.keyboard.press('Enter');
    } catch (e) {}

    await page.waitForTimeout(10000);
    await scroll(page, {
        count: 3,
        size: 200
    });

    const video = await page.$$('div[role="article"] h2');
    const randomIndex = Math.floor(Math.random() * video.length);

    try {
        await video[randomIndex].click();
        await page.waitForTimeout(5000 + Math.floor(Math.random() * (20000 - 5000)));

        if (action == "like") {
            const likeBtn = await page.$$('div[aria-label="Suka"]');
            await likeBtn[0].click();
            await page.waitForTimeout(2000);
        }

        if (action == "comment") {
            const komenBtn = await page.$$('div[aria-label="Beri komentar"]');
            await komenBtn[0].click();
            await page.waitForTimeout(2000);
            await page.keyboard.type(komenShare[Math.floor(Math.random() * komenShare.length)], { delay: 100 });
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
        }

        const shareBtn = await page.$$('div[aria-label^="Kirim ini ke teman atau posting di profil Anda."]');
        await shareBtn[0].click();
        await page.waitForTimeout(5000);

        try {
            const buttons = await page.$x(`//span[text()='Bagikan sekarang (Teman)']`);
            if (buttons.length > 0) {
                await buttons[0].click();
            } else {
                const buttons2 = await page.$x(`//span[text()='Bagikan sekarang (Publik)']`);
                await buttons2[0].click();
            }
        } catch (e) {
            console.log(message.e)
        }

        await page.waitForTimeout(10000 + Math.floor(Math.random() * (30000 - 10000)));

    } catch (e) {
        console.log(e.message)

    }

}

// Export fungsi agar bisa diakses dari file lain
module.exports = lihatVideo;