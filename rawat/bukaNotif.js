const like = require('./like');

async function bukaNotif(page) {
    const fungsiAcak = [
        async () => {
                await page.click(`a[href="/notifications/"]`);
                await page.waitForTimeout(10000);
                await page.click(`a[href="/notifications/"]`);
            },
            async () => {
                await page.click(`div[aria-label^="Messenger"]`);
                await page.waitForTimeout(10000);
                await page.click(`div[aria-label^="Messenger"]`);
            }
    ];

    // Mengacak urutan fungsi
    const urutanAcak = fungsiAcak.sort(() => Math.random() - 0.5);

    // Menjalankan fungsi-fungsi secara acak
    for (const fungsi of urutanAcak) {
        try {
            await fungsi();
            await page.waitForTimeout(10000);
        } catch (e) {
            console.log(e.message);
        }

    }

    await like(page);
}

// Export fungsi agar bisa diakses dari file lain
module.exports = bukaNotif;