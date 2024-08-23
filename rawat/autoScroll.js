async function autoScroll(page, distance = 500, second = 500) {
    await page.evaluate(async (distance, second) => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, second);
        });
    }, distance, second);
}

// Export the function to be accessible from other files
module.exports = autoScroll;