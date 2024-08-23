const like = require('./like');

async function konfirmasiTeman(page) {
    await like(page);

    //konfirmasi teman
    try {
        await page.click(
            `a[href="${page.url()}friends/"]`
        );
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(10000);
    } catch (e) {
        await page.goto(`${page.url()}friends/`, {
            waitUntil: ["load"],
            timeout: 50000,
        });
        console.log(e.message)
    }

    const buttons = await page.$x(`//span[text()='Konfirmasi']`);
    for (const button of buttons) {
        try {
            await button.click();
            await page.waitForTimeout(Math.floor(Math.random() * 1000) + 1000);
        } catch (e) {}
    }

}

// Export fungsi agar bisa diakses dari file lain
module.exports = konfirmasiTeman;