const like = require('./like');
const scroll = require('./scroll');
const fs = require("fs");

async function chatOrang(page) {
    const chatAcak = JSON.parse(fs.readFileSync(`./random/chatAcak.json`));
    // await like(page);
    //konfirmasi teman
    let r;
    await page.waitForTimeout(7000);

    try {
        const selector = `div[role="complementary"] ul li`;
        const listTeman = await page.$$(selector);

        r = Math.floor(Math.random() * listTeman.length);
        let nama = await page.$$eval(
            selector,
            (elements, rIndex) => elements[rIndex].innerText,
            r
        );
        if (nama.includes('\n')) {
            nama = nama.split('\n')[1];
        }
        nama = nama.toLowerCase().split(' ')[0];
        await listTeman[r].click();
        await page.waitForTimeout(5000);
        await page.keyboard.type(chatAcak[Math.floor(Math.random() * chatAcak.length)].replace('kak', `kak ${nama}`), { delay: 100 }, { delay: 100 });

        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
    } catch (e) {
        console.log(e.message)
    }

    await page.waitForTimeout(5000);
    let tutupObrolanBtn = await page.$$(`div[aria-label="Tutup obrolan"]`);
    for (const button of tutupObrolanBtn) {
        try {
            const hoverBtn = await page.$$(`div[class="x14yjl9h xudhj91 x18nykt9 xww2gxu x1qeybcx x19xcq9t xpz12be x4b6v7d x10e4vud x1v7wizp xxjl4ni x84okpw"]`);
            if (hoverBtn.length > 0) {
                for (const chatBtn of hoverBtn) {
                    await chatBtn.hover();
                    await page.waitForTimeout(1000);

                    await button.click();
                }
            } else {
                await page.waitForTimeout(1000);

                await button.click();
            }
        } catch (e) {}
    }
}

// Export fungsi agar bisa diakses dari file lain
module.exports = chatOrang;