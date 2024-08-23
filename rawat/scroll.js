async function scroll(page, options = {}) {
    const {
        count = 10,
            delay = 1000,
            size = 500
    } = options;

    for (let i = 0; i < count; i++) {
        // Scroll ke bawah
        await page.evaluate((size) => {
            window.scrollBy(0, size);
        }, size);

        // Tunggu sejenak setelah scroll
        await page.waitForTimeout(delay);
    }
}

// Export fungsi agar bisa diakses dari file lain
module.exports = scroll;