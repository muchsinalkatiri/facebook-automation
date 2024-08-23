const scroll = require('./scroll');

async function like(page) {
    const buttons = await page.$$('div[aria-label="Suka"]');
    const maxClicks = 3;

    if ((await page.$('div[aria-labelnode ="Konfirmasi"][role="button"][tabindex="0"]')) !== null) {
        const buttons = await page.$$('div[aria-label="Konfirmasi"][role="button"][tabindex="0"]');
        for (const button of buttons) {
            try {
                await button.click();
            } catch (e) {}
        }
        await page.waitForTimeout(10000);
    }

    await scroll(page, {
        count: 2,
        size: 500
    });
    return
    for (let i = 0; i < Math.min(maxClicks, buttons.length); i++) {
        const randomIndex = Math.floor(Math.random() * buttons.length);

        try {
            // await buttons[randomIndex].click();
        } catch (e) {
            // Handle any errors that may occur during the click
            console.error(`Error clicking random button ${i + 1}: ${e.message}`);
        }

        await scroll(page, {
            count: 5,
            size: 100
        });
        await page.waitForTimeout(10000);
    }
    // console.log(buttons.length)
}

// Export fungsi agar bisa diakses dari file lain
module.exports = like;