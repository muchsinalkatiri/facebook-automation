const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { send } = require("./helpers/telegram");


// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
// hapusTawaranPerluPerhatian()

function hapusTawaranPerluPerhatian(folder) {

    (async () => {
        let folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        let totalHapus = 0;
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

        const sendTelegram = await send(`🟡[START] Hapus Tawaran Perlu Perhatian ${lastFolder.toUpperCase()}`)
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
            // if (dt[0].split('_')[0] == "Rohana") {
            if (["Rohana", "Taufik"].includes(dt[0].split('_')[0])) {
                // await page.deleteCookie();
                // await page.close();
                continue
            }
            // console.log();
            // return;


            let page
            try {
                page = await browser.newPage();
                await page.setViewport({
                    width: 375, // Width of the device screen
                    height: 667, // Height of the device screen
                    deviceScaleFactor: 2, // Device pixel ratio
                });

                await page.setCookie(...cookie);

                await page.goto("https://www.facebook.com/marketplace/you/selling", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                const perhatian = await page.$x(`//span[text()='Perlu Perhatian']`);
                if (perhatian.length > 0) {
                    do {
                        try {
                            const button = await page.$$(`div[class="xyamay9 x13mt7qq x1w9j1nh x1rik9be x1mtsufr"] div[class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x14hiurz __fb-light-mode  x1r1pt67 x1pi30zi x1swvt13"]`);
                            await button[0].click();
                            await page.waitForTimeout(3000);
                            const hapus = await page.$x(`//span[text()='Hapus Tawaran']`);
                            await hapus[0].click();
                            await page.waitForTimeout(3000);
                            const hapusBtn = await page.$x(`//span[text()='Hapus']`);
                            for (const hps of hapusBtn) {
                                try {
                                    await hps.click();
                                    await page.waitForTimeout(6000);
                                } catch (e) {}
                            }
                            totalHapus++;
                        } catch (e) {
                            break;

                        }
                    } while (true)
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
        await send(`🟢[LAPORAN] Hapus Tawaran Perlu Perhatian ${lastFolder.toUpperCase()}:\n\nTotal Produk : ${totalHapus}`, reply_id);

        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    hapusTawaranPerluPerhatian,
};