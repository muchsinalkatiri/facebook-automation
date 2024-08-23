const like = require('./like');
const scroll = require('./scroll');


async function lihatStory(page) {
    try {
        const story = await page.$$('a[aria-label^="Cerita"]');
        const randomIndex = Math.floor(Math.random() * story.length);
        await story[randomIndex].click();
        for (let i = 0; i < randomIndex; i++) {
            await page.waitForTimeout(2000 + Math.floor(Math.random() * (5000 - 2000)));
            await page.click(
                `div[style="left: 0px; margin-left: 40px; margin-right: 0px;"]`
            );
        }
    } catch (e) {
        console.log(e.message)
    }

    await page.goto("https://facebook.com/", {
        waitUntil: ["load"],
        timeout: 50000,
    });
    await like(page);
}

// Export fungsi agar bisa diakses dari file lain
module.exports = lihatStory;