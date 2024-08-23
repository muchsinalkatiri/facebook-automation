const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { send } = require("./helpers/telegram");
const { csvToJson } = require("./helpers/global");
const autoScroll = require('./rawat/autoScroll');
const chalk = require("chalk");
const log = console.log;




// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai

rubah_alamat()
// Baca isi direktori
// let file_cookies = [];
function rubah_alamat(folder) {

    (async () => {
        let folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        let total = 0;

        const lokasi = await csvToJson('C:/Users/Administrator/Documents/fbmp/Laporan/malang.csv');

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
        // send(`🟡[START] Rubah Alamat`);



        for (let i = 37; i < fileNames.length; i++) {
            // console.log(fileNames[i]);
            log(chalk.blue(`i ke = ${i} => ${fileNames[i]}`));

            if (!fs.existsSync(`${folderPath}/${fileNames[i]}`)) {
                continue
            }
            const csvContent = fs.readFileSync(
                `${folderPath}/${fileNames[i]}`,
                "utf-8"
            );
            const cookie = parseCookieData(csvContent);
            const dt = fileNames[i].replace('.csv', '').split('#');

            let page = await browser.newPage();
            try {
                await page.setCookie(...cookie);

                await page.goto("https://www.facebook.com/marketplace/you/selling?order=CREATION_TIMESTAMP&state=LIVE&status[0]=IN_STOCK", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                await page.waitForTimeout(3000); //delay 2 detik

                await autoScroll(page, 700, 1200);
                let linkArray = [];
                const postingans = await page.$$('div[class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w x1k70j0n xzueoph xzboxd6 x14l7nz5"]')
                for (const postingan of postingans) {
                    try {

                        const lainyaBtn = await postingan.$$('div[aria-label="Lainnya"]')
                        await lainyaBtn[0].click();
                        await page.waitForTimeout(1000); //delay 2 detik

                        let link = await page.$eval(
                            'a[class="x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n xe8uvvx x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz xjyslct x9f619 x1ypdohk x78zum5 x1q0g3np x2lah0s xnqzcj9 x1gh759c xdj266r xat24cr x1344otq x1de53dj x1n2onr6 x16tdsg8 x1ja2u2z x6s0dn4 x1y1aw1k xwib8y2"]',
                            (el) => el.href
                        );

                        const pathSegments = link.split(/\\|\//);
                        const idPosting = pathSegments[pathSegments.length - 2];

                        linkArray.push(idPosting)
                        await lainyaBtn[0].click();

                    } catch (e) {}
                }


                // let linkArray = ['400631369189553'];
                log(chalk.yellow("total produk : " + linkArray.length))


                if (linkArray.length == 0) {
                    await page.close();

                    continue
                }
                for (link of linkArray) {
                    try {
                        // page = await browser.newPage();

                        let lokasiRandom = lokasi[Math.floor(Math.random() * lokasi.length)]['Lokasi Posting']
                        console.log(link)

                        await page.goto(`https://www.facebook.com/marketplace/edit/?listing_id=${link}`, {
                            waitUntil: ["load"],
                        });

                        let judul = await page.$eval(
                            'label[aria-label="Judul"] input',
                            (el) => el.value
                        );

                        if (!judul.toLowerCase().includes('kambing')) {
                            console.log('bukan produk kambing')

                            continue
                        }

                        const kondisi = await page.$('label[aria-label="Kondisi"]');
                        await kondisi.click();
                        await page.waitForTimeout(2000); //delay 2 detik
                        const baruList = await page.$x(`//span[text()='Baru']`);
                        for (const baru of baruList) {
                            try {
                                await baru.click();
                                await page.waitForTimeout(1000);
                            } catch (e) {}
                        }
                        await page.waitForTimeout(2000); //delay 2 detik

                        const labelInput = await page.$$('label[aria-label="Label produk"] textarea');
                        const textareaValue = await page.evaluate(el => el.value, labelInput[0]);

                        if (textareaValue.trim() === '') {
                            await labelInput[0].click();
                            await labelInput[0].type("daging kambing, daging kambing segar, daging kambing murah, daging kambing frozen, daging kambing muda, daging kambing mentah,");
                            await page.waitForTimeout(2000); // delay 2 detik
                        }

                        const lokasiInput = await page.$$('input[aria-label="Lokasi"]');
                        await lokasiInput[0].click();
                        await lokasiInput[0].type(lokasiRandom);
                        await page.waitForTimeout(3000); //delay 2 detik


                        const lokasiSaran = await page.$$('ul[role="listbox"] li');
                        await lokasiSaran[0].click();
                        await page.waitForTimeout(3000); //delay 2 detik


                        const perbaruiBtn = await page.$('div[aria-label="Perbarui"][role="button"]');
                        await perbaruiBtn.click()

                        // await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
                        await page.waitForTimeout(10000); //delay 2 detik

                        // console.log(page.url())
                        if (page.url() == 'https://www.facebook.com/marketplace/you/selling') {
                            log(chalk.green('berhasil'));
                            // continue
                        } else {
                            await page.waitForTimeout(5000); //delay 2 detik
                            log(chalk.red('lamaaa'));
                        }

                    } catch (e) {
                        log(chalk.red(e.message))
                        // continue
                    }
                    // await page.close();
                }

            } catch (e) {
                log(chalk.red(e.message))
                // await page.deleteCookie();
                // await page.close();
                // continue
            }
            // return
            await page.deleteCookie();
            await page.close();
            continue;
        }
        send(`🟢[LAPORAN] Hapus Tawaran Perlu Perhatian ${lastFolder.toUpperCase()}:\n\nTotal Produk : ${totalHapus}`);

        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    rubah_alamat,
};