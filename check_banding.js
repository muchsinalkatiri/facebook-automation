const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { send } = require("./helpers/telegram");
const { parseCookieData, transformCookies } = require("./helpers/cookies");



const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies/cp/banding"; // Gantilah dengan path folder yang sesuai
const folderAsli = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
function check_banding() {
    (async () => {
        let totalLolos = 0;
        const browser = await puppeteer.launch({ // headless: 'new',
            headless: false,
            // slowMo: 100,
            defaultViewportt: null,
            args: ["--start-maximized"],
            devtools: false,
        });
        const fileName = fs.readdirSync(folderPath);
        const fileNames = fileName.filter((filenam) => filenam.endsWith(".csv"));

        const pathSegments = folderPath.split(/\\|\//);
        const lastFolder = pathSegments[pathSegments.length - 1];

        const sendTelegram = await send(`🟡[START] CHECK BANDING FOLDER ${lastFolder.toUpperCase()}`);
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
                    if ((await page.$("div>div>a>img")) !== null) {
                        console.log("ada sesi login");
                        await page.click("div>div>a>img");
                        await page.type("#pass", dt[3]);
                        await page.click(
                            'div[aria-labelledby="Log in"]>div>div>div>div>form>div>button'
                        );
                        await page.waitForNavigation({
                            waitUntil: ["load"],
                        });
                    } else {
                        console.log("tidak ada sesi login");
                        continue;
                    }
                } else {
                    // console.log("sudah login");
                }


                // await page.waitForTimeout(10000); //delay 2 detik
                const cookiesObject = await page.cookies();
                const transformedData = await transformCookies(cookiesObject);

                fs.writeFileSync(`${folderPath}/${fileNames[i]}`, transformedData);

                if (!page.url().includes("checkpoint")) {
                    console.log("lolos");
                    totalLolos++;
                    await fs.rename(
                        `${folderPath}/${fileNames[i]}`,
                        `${folderAsli}/${fileNames[i]}`,
                        (err) => {
                            if (err) {
                                console.error("Error moving file:", err);
                            } else {
                                console.log("File moved successfully!");
                            }
                        }
                    );
                    await page.deleteCookie();
                    await page.close();
                    continue;
                }


                await page.waitForTimeout(7000);

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
        await send(`🟢[LAPORAN] CHECK BANDING FOLDER ${lastFolder.toUpperCase()}:\n\nTotal Akun : ${fileNames.length}\nLolos : ${totalLolos}\n`, reply_id);
        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    check_banding,
};