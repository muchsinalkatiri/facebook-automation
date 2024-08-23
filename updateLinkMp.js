const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { send } = require("./helpers/telegram");
const { csvToJson } = require("./helpers/global");
const autoScroll = require('./rawat/autoScroll');
const chalk = require("chalk");
const log = console.log;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai

// Baca isi direktori
// let file_cookies = [];
function updateLinkMp(folder) {

    (async () => {
        let folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        let total = 0;

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
        const sendTelegram = await send(`🟡[START] UPDATE LINK MP`);
        const reply_id = sendTelegram.result.message_id;
        let totalProduk = 0;
        let totalUpdate = 0;
        let totalNew = 0;

        for (let i = 0; i < fileNames.length; i++) {
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
                let data = [];
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

                        let judul = await postingan.$eval('span[class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 x1j85h84"]', (el) => el.textContent)
                        if (judul.includes(',')) {
                            const judulSplit = judul.split(",")
                            if (judulSplit.length == 3) {
                                judul = judulSplit[1]
                            } else if (judulSplit.length == 2) {
                                judul = judulSplit[0]
                            }
                        }
                        let klik_tawaran = await postingan.$eval('div[class="x78zum5 x1q0g3np xg7h5cd"]', (el) => el.textContent)
                        klik_tawaran = klik_tawaran.replaceAll('klik tawaran', "").replaceAll(" ", "")

                        const pathSegments = link.split(/\\|\//);
                        const idPosting = pathSegments[pathSegments.length - 2];

                        data.push({ "id": idPosting, "judul": judul, "klik_tawaran": klik_tawaran, "userId": dt[1] })
                        await lainyaBtn[0].click();

                    } catch (e) {}
                }

                log(chalk.yellow("total produk : " + data.length))


                if (data.length == 0) {
                    await page.close();

                    continue
                }
                totalProduk = totalProduk + data.length

                const masterLinkPath = 'C:/Users/Administrator/Documents/fbmp/Cookies/master/masterLinkMp.csv'
                const masterLink = await csvToJson(masterLinkPath);

                for (const entry of data) {
                    // Check if the 'id' already exists in 'masterLink'
                    const existingEntryIndex = masterLink.findIndex(masterEntry => masterEntry.id === entry.id);

                    if (existingEntryIndex !== -1) {
                        // log('sudah ada')
                        // If the 'id' exists, update 'klik_tawaran'
                        totalUpdate++
                        masterLink[existingEntryIndex].klik_tawaran = entry.klik_tawaran;
                    } else {
                        // If the 'id' doesn't exist, add a new entry to 'masterLink'
                        // log('belum ada')
                        // const klik_kita = 0;
                        totalNew++
                        masterLink.push({ "id": entry.id, "judul": entry.judul, "klik_tawaran": entry.klik_tawaran, "klik_kita": 0, "userId": entry.userId });
                    }
                }

                masterLink.sort((a, b) => {
                    return b.klik_tawaran - a.klik_tawaran;
                });


                // Create a CSV writer
                const csvWriter = createCsvWriter({
                    path: masterLinkPath,
                    header: [
                        { id: 'id', title: 'id' },
                        { id: 'judul', title: 'judul' },
                        { id: 'klik_tawaran', title: 'klik_tawaran' },
                        { id: 'klik_kita', title: 'klik_kita' },
                        { id: 'userId', title: 'userId' },
                    ],
                    append: false, // Set to true if you want to append to an existing file
                });

                // Write the updated 'masterLink' array to the CSV file
                csvWriter.writeRecords(masterLink)
                    .then(() => {
                        console.log('CSV file has been updated successfully.');
                    })
                    .catch((error) => {
                        console.error('Error writing CSV file:', error);
                    });



            } catch (e) {
                log(chalk.red(e.message))
                // await page.deleteCookie();
                // await page.close();
                // continue
            }
            await page.deleteCookie();
            await page.close();
            continue;
        }
        await send(`🟢[LAPORAN] UPDATE LINK MP:\n\nTotal Produk : ${totalProduk}\nProduk Update : ${totalUpdate}\nProduk Baru : ${totalNew}`, reply_id);

        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    updateLinkMp,
};