const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { send } = require("./helpers/telegram");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const autoScroll = require('./rawat/autoScroll');




// const folderPath = "Cookies/cp/tinjauan"; // Gantilah dengan path folder yang sesuai
// const folderAsli = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
function obati_duplikat(folder) {
    (async () => {
        let folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        const folderAsli = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        totalObati = 0;

        if (folder) {
            folderPath = `${folderPath}/${folder}`
        }

        const browser = await puppeteer.launch({
            // headless: 'new',
            headless: false,
            // slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });
        const fileName = fs.readdirSync(folderPath);
        const fileNames = fileName.filter((filenam) => filenam.endsWith(".csv"));

        const pathSegments = folderPath.split(/\\|\//);
        const lastFolder = pathSegments[pathSegments.length - 1];


        const sendTelegram = await send(`🟡[START] OBATI DUPLIKAT ${lastFolder.toUpperCase()}`)
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

                await page.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                if ((await page.$('input[id="email"]')) !== null) { //jika belum login
                    console.log("belum login");
                    await page.deleteCookie();
                    await page.close();
                    continue
                }

                if (page.url().includes("checkpoint")) {
                    console.log("checkpoint");
                    await page.deleteCookie();
                    await page.close();
                    continue;
                }


                do {
                    await page.goto("https://www.facebook.com/marketplace/you/selling", {
                        waitUntil: ["load", "networkidle0"],
                        timeout: 50000,
                    });


                    await page.waitForTimeout(3000); //delay 2 detik
                    const perluPerhatian = await page.$$('div[class="xyamay9 x13mt7qq x1w9j1nh x1rik9be x1mtsufr"]');
                    if (perluPerhatian.length > 0) {
                        let tandaiTerjualBtn = await perluPerhatian[0].$$('div[aria-label="Tandai sebagai Terjual"]');
                        if (tandaiTerjualBtn.length == 0) {
                            await autoScroll(page);
                            tandaiTerjualBtn = await perluPerhatian[0].$$('div[aria-label="Tandai sebagai Terjual"]');
                        }
                        if (tandaiTerjualBtn.length == 0) {
                            break
                        }

                        try {
                            const tandaiTerjualBtn = await perluPerhatian[0].$$('div[aria-label="Tandai sebagai Terjual"]');
                            await tandaiTerjualBtn[0].click();

                        } catch (e) {}
                        await page.waitForTimeout(3000); //delay 2 detik


                        try {
                            await page.goto("https://www.facebook.com/marketplace/you/selling?state=LIVE&status[0]=OUT_OF_STOCK", {
                                waitUntil: ["load", "networkidle0"],
                                timeout: 50000,
                            });

                            const tawarkanUlangBtn = await page.$$('div[aria-label="Tawarkan Ulang Produk Ini"]');
                            await tawarkanUlangBtn[0].click();
                            await page.waitForTimeout(3000); //delay 2 detik

                            const lainyaBtn = await page.$$('div[aria-label="Lainnya"]');
                            await lainyaBtn[0].click();
                            await page.waitForTimeout(3000); //delay 2 detik

                            const hapusTawaranBtn = await page.$x(`//span[text()='Hapus Tawaran']`);
                            await hapusTawaranBtn[0].click()
                            await page.waitForTimeout(3000); //delay 2 detik

                            const hapusBtn = await page.$$('div[aria-label="Hapus"]');
                            await hapusBtn[hapusBtn.length - 1].click()
                            await page.waitForTimeout(5000); //delay 2 detik
                            totalObati++;
                        } catch (e) {
                            console.log(e.message)
                        }
                    } else {
                        break;
                    }
                } while (true)

                // return;

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

            await page.waitForTimeout(7000);
            await page.deleteCookie();
            await page.close();


            continue;
        }
        await send(`🟢[LAPORAN] OBATI DUPLIKAT ${lastFolder.toUpperCase()}:\n\nTotal Produk : ${totalObati}`, reply_id);
        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    obati_duplikat,
};