const like = require('./like');
const scroll = require('./scroll');

async function saranTeman(page) {
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

    await scroll(page, {
        count: 3,
        size: 200
    });

    await page.waitForTimeout(6000);
    const buttons = await page.$$(`div[aria-label="Tambah jadi teman"]`);
    const randomIndex = Math.floor(Math.random() * buttons.length);

    try {
        await buttons[randomIndex].click();
    } catch (e) {
        console.log(e.message);
    }

    // console.log(buttons);
    await page.waitForTimeout(10000);



}

// Export fungsi agar bisa diakses dari file lain
module.exports = saranTeman;