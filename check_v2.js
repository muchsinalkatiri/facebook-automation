const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { send } = require("./helpers/telegram");
const { parseCookieData, transformCookies } = require("./helpers/cookies");

const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
function check_v2() {
    (async () => {
        // send('start check')
        do {
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

            for (let i = 0; i < fileNames.length; i++) {
                console.log(fileNames[i]);
                const csvContent = fs.readFileSync(
                    `${folderPath}/${fileNames[i]}`,
                    "utf-8"
                );
                const cookie = parseCookieData(csvContent);
                const dt = fileNames[i].replace('.csv', '').split('#');
                // console.log(dtArray);
                // return;


                const page = await browser.newPage();

                await page.setCookie(...cookie);

                await page.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                const csvContent2 = fs.readFileSync(
                    `${folderPath}/${fileNames[i+1]}`,
                    "utf-8"
                );
                const cookie2 = parseCookieData(csvContent2);

                const page2 = await browser.newPage();

                await page2.setCookie(...cookie2);

                await page2.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                return;
            }
            await browser.close();
        } while (true)
    })().catch((err) => console.error(err));
}

module.exports = {
    check_v2,
};