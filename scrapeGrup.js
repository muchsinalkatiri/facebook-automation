const puppeteer = require("puppeteer");
const fs = require("fs");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const readline = require('readline');
const chalk = require("chalk");
const { send } = require("./helpers/telegram");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const logRed = (message) => console.log(chalk.red(message));
const logGreen = (message) => console.log(chalk.green(message));
const log = console.log


// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai
const folderCp = "C:/Users/Administrator/Documents/fbmp/Cookies/cp"; // Gantilah dengan path folder yang sesuai
const folderCampaign = "C:/Users/Administrator/Documents/fbmp/tinjauan/Campaign"; // Gantilah dengan path folder yang sesuai

scrapeGrup();

function scrapeGrup(
    folderPath = "C:/Users/Administrator/Documents/fbmp/tinjauan/Cookies"
) {
    (async () => {
        const data = []
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const kata_kunci = await new Promise((resolve) => {
            rl.question("1. Masukan kata kunci grub: ", (input) => {

                if (!input) {
                    logRed("kata kunci harus dimasukan")
                    rl.close();
                    return
                }
                resolve(input);
            });
        });

        const totalGrup = await new Promise((resolve) => {
            rl.question("2. Berapa grub yang mau discrape?: ", (input) => {

                if (!input) {
                    logRed("jumlah harus dimasukan")
                    rl.close();
                    return
                }

                if (input <= 0) {
                    logRed("jumlah harus lebih dari 0")
                    rl.close();
                    return
                }
                resolve(input);
            });
        });

        const namaFile = await new Promise((resolve) => {
            rl.question("3. File mau disimpan dengan nama apa? ", (input) => {

                if (!input) {
                    logRed("nama file harus dimasukan")
                    rl.close();
                    return
                }
                resolve(input);
            });
        });


        const fileName = fs.readdirSync(folderPath);
        const fileNames = fileName.filter((filenam) => filenam.endsWith(".csv"));

        const pathSegments = folderPath.split(/\\|\//);
        let lastFolder;
        if (folderPath.includes("tinjauan")) {
            lastFolder = "tinjauan";
        } else {
            lastFolder = pathSegments[pathSegments.length - 1];
        }

        // const sendTelegram = await send(
        //     `🟡[START] RAWAT AKUN FOLDER ${lastFolder.toUpperCase()}`
        // );
        // const reply_id = sendTelegram.result.message_id;

        const browser = await puppeteer.launch({
            headless: false,
            // slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });


        let i = 0;
        let page = await browser.newPage();
        try {
            console.log(fileNames[i]);
            const dt = fileNames[i].replace(".csv", "").split("#");

            const csvContent = fs.readFileSync(
                `${folderPath}/${fileNames[i]}`,
                "utf-8"
            );
            const cookie = parseCookieData(csvContent);

            await page.setCookie(...cookie);

            await page.goto(`https://www.facebook.com/search/groups/?q=${kata_kunci.replaceAll(" ", "%20")}`, {
                waitUntil: ["load"],
                timeout: 50000,
            });

            let grups = await page.$$(`div[role="article"]`);
            while (grups.length < totalGrup) {
                await page.evaluate(() => {
                    window.scrollBy(0, 500);
                });

                await page.waitForTimeout(1000);
                grups = await page.$$(`div[role="article"]`);
            }
            let n = 1;
            for (const grup of grups) {
                let link = await grup.$eval(
                    'a[role="presentation"]',
                    (el) => el.href
                );

                let nama = await grup.$eval(
                    'a[role="presentation"]',
                    (el) => el.textContent
                );


                data.push({
                    "Nomor": n,
                    "Nama Grup": nama,
                    "Link Grup": link
                })

                if (n == totalGrup) {
                    break;
                }
                n++
            }

            log(data);

        } catch (e) {
            console.log(e.message);
            await page.deleteCookie();
            await page.close();
        }
        await page.deleteCookie();
        await page.close();

        await browser.close();

        const path = `${folderCampaign}/link grup - ${namaFile}.csv`;
        const csvWriter = createCsvWriter({
            path: path,
            header: [
                { id: 'Nomor', title: 'nomor' },
                { id: 'Nama Grup', title: 'Nama Grup' },
                { id: 'Link Grup', title: 'Link Grup' },
            ],
            append: false, // Set to true if you want to append to an existing file
        });

        // Write the updated 'masterLink' array to the CSV file
        csvWriter.writeRecords(data)
            .then(() => {
                console.log('CSV file has been updated successfully.');
            })
            .catch((error) => {
                console.error('Error writing CSV file:', error);
            });
    })().catch((err) => console.error(err));
}

module.exports = {
    scrapeGrup,
};