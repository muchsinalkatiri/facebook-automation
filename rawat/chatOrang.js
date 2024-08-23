const like = require('./like');
const scroll = require('./scroll');
const fs = require("fs");

async function chatOrang(page) {
    const chatAcak = JSON.parse(fs.readFileSync(`./random/chatAcak.json`));
    await like(page);
    try {
        await page.click(
            `a[href="${page.url()}friends/"]`
        );
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    } catch (e) {
        await page.goto(`${page.url()}friends/`, {
            waitUntil: ["load"],
            timeout: 50000,
        });
        console.log(e.message)
    }
    await page.waitForTimeout(5000);

    try {
        const btnSaran = await page.$x(`//span[text()='Saran']`);
        await btnSaran[0].click();
        await page.waitForTimeout(5000);
    } catch (e) {}

    const orang = await page.$$('div[class="x9f619 x4pfjvb x1iyjqo2 xs83m0k x193iq5w x1mkiy5m x10b6aqq x1pi30zi x1yrsyyn"] div[class="x78zum5 xdt5ytf xz62fqu x16ldp7u"]');
    const randomIndex = Math.floor(Math.random() * orang.length);
    try {
        await orang[randomIndex].click();
        await page.waitForTimeout(5000);
    } catch (e) {}

    const btnTambahTeman = await page.$x(`//span[text()='Tambahkan teman']`);
    try {
        await btnTambahTeman[0].click();
        await page.waitForTimeout(5000);
    } catch (e) {}

    let nama = "";
    try {
        nama = await page.$eval(
            'div[role="main"] div span h1',
            (el) => el.textContent
        );
        nama = nama.toLowerCase().split(' ')[0];
    } catch (e) {
        console.error(e);
    }

    const btnKirimPesan = await page.$x(`//span[text()='Kirim pesan']`);
    try {
        await btnKirimPesan[0].click();
        await page.waitForTimeout(5000);
        await page.keyboard.type(chatAcak[Math.floor(Math.random() * chatAcak.length)].replace('kak', `kak ${nama}`), { delay: 100 }, { delay: 100 });

        await page.waitForTimeout(1000);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

    } catch (e) {}

    await page.waitForTimeout(5000);
    const tutupObrolanBtn = await page.$$(`div[aria-label="Tutup obrolan"]`);
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