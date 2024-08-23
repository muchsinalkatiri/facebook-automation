const like = require('./like');
const scroll = require('./scroll');
const fs = require("fs");

async function lihatArtikel(page, action) {
    const kata_kunci = JSON.parse(fs.readFileSync(`./random/kataKunciIslami.json`));
    const komenShare = JSON.parse(fs.readFileSync(`./random/komenShare.json`));
    await like(page);

    await page.waitForTimeout(10000);

    const kk = kata_kunci[Math.floor(Math.random() * kata_kunci.length)];
    const search = await page.$$('input[placeholder="Cari di Facebook"]');
    try {
        await search[0].click();
        await search[0].type(kk);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        const postinganBtn = await page.$x(`//span[text()='Postingan']`);
        await postinganBtn[0].click();
    } catch (e) {}

    await page.waitForTimeout(10000);
    await scroll(page, {
        count: 5,
        size: 200
    });
    await page.waitForTimeout(5000);


    const artikels = await page.$$('div[role="article"]');
    let randomIndex = Math.floor(Math.random() * artikels.length);
    let artikel = artikels[randomIndex];

    try {
        if (action == "like") {
            const likeBtn = await artikel.$$('div[aria-label="Suka"]');
            await likeBtn[0].click();
            await page.waitForTimeout(2000);
        }
        if (action == "comment") {
            const commentBtn = await artikel.$$('div[aria-label="Beri komentar"]');
            await commentBtn[0].click();
            await page.waitForTimeout(5000);
            await page.keyboard.type(komenShare[Math.floor(Math.random() * komenShare.length)], { delay: 100 });
            await page.waitForTimeout(1000);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
        }

        // console.log(likeBtn)
        // return
        if ((await page.$('div[role="dialog"][class="x1n2onr6 x1ja2u2z x1afcbsf xdt5ytf x1a2a7pz x71s49j x1qjc9v5 x1qpq9i9 xdney7k xu5ydu1 xt3gfkd x78zum5 x1plvlek xryxfnj xcatxm7 xrgej4m xh8yej3"]')) !== null) {
            console.log('ada dialog box')
            const shareBtn = await page.$$('div[aria-label^="Kirim ini ke teman atau posting di profil Anda."]');
            await shareBtn[shareBtn.length - 1].click();
            await page.waitForTimeout(2000);

            // const buttons = await page.$x(`//span[text()='Bagikan sekarang (Publik)']`);
        } else {
            console.log('tdk ada dialog box')
            const shareBtn = await artikel.$$('div[aria-label^="Kirim ini ke teman atau posting di profil Anda."]');
            await shareBtn[0].click();
            await page.waitForTimeout(2000);

        }
        try {
            const buttons = await page.$x(`//span[text()='Bagikan sekarang (Teman)']`);
            if (buttons.length > 0) {
                await buttons[0].click();
            } else {
                const buttons2 = await page.$x(`//span[text()='Bagikan sekarang (Publik)']`);
                await buttons2[0].click();
            }
        } catch (e) {}


        await page.waitForTimeout(5000);

    } catch (e) {
        console.log(e.message)

    }

}

// Export fungsi agar bisa diakses dari file lain
module.exports = lihatArtikel;