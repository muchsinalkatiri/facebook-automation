const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { send } = require("./helpers/telegram");

const { tutupObrolan, isLogin, isCp, isMp, isLimit, listAccount, cookiesPath, updateListAccount } = require("./helpers/facebook");



// Baca isi direktori
// let file_cookies = [];
// hapusTawaranPerluPerhatian()

function hapusTawaranPerluPerhatian(folder) {

    (async () => {
        let totalHapus = 0;
        const browser = await puppeteer.launch({
            // headless: 'new',
            headless: false,
            // slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });
        const log = console.log;

        if (folder) {
            folderPath = `${folderPath}/${folder}`
        }

        const list_account = await listAccount('sh', 'all', 'all', 'all');


        const sendTelegram = await send(`🟡[START] Hapus Tawaran Perlu Perhatian`)
        const reply_id = sendTelegram.result.message_id;


        for (let i = 0; i < list_account.length; i++) {
            let account = list_account[i];
            const namaAkun = account['Nama Akun'];
            log(namaAkun)
            const fileName = `${cookiesPath}/${account['Nama Project']}/${namaAkun}/${namaAkun}.json`
            if (!fs.existsSync(fileName)) {
                log(chalk.red(`[COOKIE TIDAK ADA] ${namaAkun}`));
                continue;
            }

            const cookie = JSON.parse(fs.readFileSync(fileName));


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

                        await page.waitForTimeout(3000);
                do {
                    const perhatian = await page.$x(`//span[text()='Perlu Perhatian']`);
                    if (perhatian.length == 0) {
                        break;
                    }

                    try {
                        const button = await page.$$(`div[aria-label^="Opsi lainnya"]`);

                         if(button.length == 0){
                            break;
                         }
                        for (const btn of button) {
                            try {
                                await btn.click();
                                await page.waitForTimeout(3000);
                                // break;
                            } catch (e) {}
                        }
                        const hapus = await page.$x(`//span[text()='Hapus tawaran']`);
                        await hapus[0].click();
                        await page.waitForTimeout(3000);
                        const hapusBtn = await page.$x("//div[@aria-label='Hapus']//span[text()='Hapus']");
                        await hapusBtn[0].click();                
                        await page.waitForTimeout(6000);
                        totalHapus++;
                    } catch (e) {
                        console.log(e)
                        // return;

                    }
                } while (true)

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
        await send(`🟢[LAPORAN] Hapus Tawaran Perlu Perhatian :\n\nTotal Produk : ${totalHapus}`, reply_id);

        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    hapusTawaranPerluPerhatian,
};