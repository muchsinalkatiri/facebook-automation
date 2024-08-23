const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { send } = require("./helpers/telegram");
const autoScroll = require('./rawat/autoScroll');



// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
function tawarkan_ulang(folder) {

    (async () => {
        let totalProduk = 0
        let folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        const browser = await puppeteer.launch({
            // headless: 'new',
            headless: false,
            // slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });
        if (folder) {
            folderPath = `${folderPath}/${folder}`
        }

        const fileName = fs.readdirSync(folderPath);
        const fileNames = fileName.filter((filenam) => filenam.endsWith(".csv"));

        const pathSegments = folderPath.split(/\\|\//);
        const lastFolder = pathSegments[pathSegments.length - 1];

        const sendTelegram = await send(`🟡[START] TAWARKAN ULANG `);
        const reply_id = sendTelegram.result.message_id;


        for (let i = 0; i < fileNames.length; i++) {
            console.log(fileNames[i]);
            if (!fs.existsSync(`${folderPath}/${fileNames[i]}`)) {
                continue
            }
            const csvContent = fs.readFileSync(
                `${folderPath}/${fileNames[i]}`,
                "utf-8"
            );
            const cookie = parseCookieData(csvContent);
            const dt = fileNames[i].replace('.csv', '').split('#');

            let page
            try {
                page = await browser.newPage();
                await page.setCookie(...cookie);

                await page.goto("https://www.facebook.com/marketplace/you/selling?order=CREATION_TIMESTAMP&state=LIVE&status[0]=IN_STOCK", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                await autoScroll(page);

                try {
                    const postingans = await page.$$('div[class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1k70j0n xzueoph xzboxd6 x14l7nz5"]')
                    for (const postingan of postingans) {
                        try {

                            const lainyaBtn = await postingan.$$('div[aria-label="Lainnya"]')
                            await lainyaBtn[0].click();
                            await page.waitForTimeout(5000); //delay 2 detik

                            const sdhDitawarkan = await page.$x(`//span[starts-with(text(),'Perbarui (')]`);
                            if (sdhDitawarkan.length > 0) {
                                await lainyaBtn[0].click();
                                // console.log("sudah ditawarkan")
                            } else {
                                const tawarkanUlangBtn = await page.$x(`//span[text()='Perbarui penawaran']`);
                                await tawarkanUlangBtn[0].click()
                                await page.waitForTimeout(3000); //delay 2 detik
                                totalProduk++;

                            }
                        } catch (e) {}


                    }

                } catch (e) {
                    console.log(e.message)
                }

                // await page.waitForTimeout(10000); //delay 2 detik
                const cookiesObject = await page.cookies();
                const transformedData = await transformCookies(cookiesObject);

                await fs.writeFileSync(`${folderPath}/${fileNames[i]}`, transformedData);
            } catch (e) {
                console.log(e.message)
                await page.deleteCookie();
                await page.close();
                continue
            }

            await page.deleteCookie();
            await page.close();
            continue;
        }

        await send(`🟢[LAPORAN] TAWARKAN ULANG :\n\nTotal Produk : ${totalProduk}`, reply_id);

        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    tawarkan_ulang,
};