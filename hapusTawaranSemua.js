const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { send } = require("./helpers/telegram");


const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
(async () => {
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
    let total = 0;

    const sendTelegram = await send(`🟡[START] Hapus Tawaran Semua`)
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
        // console.log(dtArray);
        // return;


        let page = await browser.newPage();
        let page
        try {
            await page.setViewport({
                width: 375, // Width of the device screen
                height: 667, // Height of the device screen
                deviceScaleFactor: 2, // Device pixel ratio
            });
            page = await browser.newPage();
            await page.setCookie(...cookie);

            await page.goto("https://www.facebook.com/marketplace/you/selling", {
                waitUntil: ["load"],
                timeout: 50000,
            });

            // const perhatian = await page.$x(`//span[text()='Perlu Perhatian']`);
            // if (perhatian.length > 0) {
            const buttons = await page.$$(`div[class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x14hiurz __fb-light-mode  x1r1pt67 x1pi30zi x1swvt13"]`);
            for (const button of buttons) {
                try {
                    await button.click();
                    await page.waitForTimeout(3000);
                    const hapus = await page.$x(`//span[text()='Hapus Tawaran']`);
                    await hapus[0].click();
                    await page.waitForTimeout(3000);
                    const hapusBtn = await page.$x(`//span[text()='Hapus']`);
                    for (const button of hapusBtn) {
                        try {
                            await button.click();
                            await page.waitForTimeout(8000);
                            total++
                        } catch (e) {}
                    }

                } catch (e) {}
                // }
            }

            // return
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
    await send(`🟢[LAPORAN] Hapus Tawaran Semua, total ${total}`, reply_id)
    await browser.close();
})().catch((err) => console.error(err));