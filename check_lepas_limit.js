const fs = require("fs");
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const csv = require("csv-parser");
const { send } = require("./helpers/telegram");
const { parseCookieData, transformCookies } = require("./helpers/cookies");





// Baca isi direktori
// let file_cookies = [];
function check_lepas_limit(folder) {
    (async () => {
        let folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        const folderNormal = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        const folderTinjauan = "C:/Users/Administrator/Documents/fbmp/tinjauan/Cookies"; // Gantilah dengan path folder yang sesuai
        const folderRawat = "C:/Users/Administrator/Documents/fbmp/Cookies/rawat"; // Gantilah dengan path folder yang sesuai

        // let folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai
        // const folderNormal = "Cookies"; // Gantilah dengan path folder yang sesuai
        // const folderRawat = "Cookies/rawat"; // Gantilah dengan path folder yang sesuai
        // const folderTinjauan = "Cookies/tinjauan"; // Gantilah dengan path folder yang sesuai

        if (folder) {
            folderPath = `${folderPath}/${folder}`
        }
        const log = console.log;
        let totalDitinjau = 0;
        let totalLepasLimit = 0;
        let totalMasihLimit = 0;
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

        const sendTelegram = await send(`🟡[START] CHECK LEPAS LIMIT FOLDER ${lastFolder.toUpperCase()}`);
        const reply_id = sendTelegram.result.message_id;

        for (let i = 0; i < fileNames.length; i++) {
            let newFileName = "";

            if (!fs.existsSync(`${folderPath}/${fileNames[i]}`)) {
                continue
            }
            const csvContent = fs.readFileSync(
                `${folderPath}/${fileNames[i]}`,
                "utf-8"
            );
            const cookie = parseCookieData(csvContent);
            const dt = fileNames[i].replaceAll('.csv', '').split('#');


            let page
            try {
                page = await browser.newPage();

                await page.setCookie(...cookie);


                await page.goto("https://mtouch.facebook.com/marketplace/selling/item", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });


                if ((await page.$x(`//div[text()='Marketplace Tidak Tersedia untuk Anda']`)).length > 0) {
                    log(chalk.yellow(`[BELUM LEPAS] ${dt[0]}`));
                    totalMasihLimit++;
                    if (typeof dt[4] === 'undefined') {
                        newFileName = `${fileNames[i].replaceAll('.csv', '')}#0`
                    } else {
                        newFileName = fileNames[i].replaceAll('.csv', '').replace(dt[4], '0')
                    }
                    await fs.rename(
                        `${folderPath}/${fileNames[i]}`,
                        `${folderRawat}/${newFileName}.csv`,
                        (err) => {
                            if (err) {
                                console.error("Error moving file:", err);
                            } else {
                                console.log("File moved successfully!");
                            }
                        }
                    );
                }

                if ((await page.$x(`//div[text()='Anda Tidak Bisa Jual Beli di Facebook']`)).length > 0) {
                    log(chalk.red(`[TINJAUAN] ${dt[0]}`));
                    totalDitinjau++;
                    if (typeof dt[4] === 'undefined') {
                        newFileName = `${fileNames[i].replaceAll('.csv', '')}#2`
                    } else {
                        newFileName = fileNames[i].replaceAll('.csv', '').replace(dt[4], '2')
                    }
                    await fs.rename(
                        `${folderPath}/${fileNames[i]}`,
                        `${folderTinjauan}/${newFileName}.csv`,
                        (err) => {
                            if (err) {
                                console.error("Error moving file:", err);
                            } else {
                                console.log("File moved successfully!");
                            }
                        }
                    );
                }

                if ((await page.$('div[aria-label="Tambahkan foto"]')) !== null) {
                    log(chalk.green(`[LEPAS LIMIT] ${dt[0]}`));
                    totalLepasLimit++;
                    if (typeof dt[4] === 'undefined') {
                        newFileName = `${fileNames[i].replaceAll('.csv', '')}#1`
                    } else {
                        newFileName = fileNames[i].replaceAll('.csv', '').replace(dt[4], '1')
                    }
                    await fs.rename(
                        `${folderPath}/${fileNames[i]}`,
                        `${folderNormal}/${newFileName}.csv`,
                        (err) => {
                            if (err) {
                                console.error("Error moving file:", err);
                            } else {
                                console.log("File moved successfully!");
                            }
                        }
                    );
                }

                // return;

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
        await send(`🟢[LAPORAN] CHECK LEPAS LIMIT FOLDER ${lastFolder.toUpperCase()}:\n\nLepas Limit : ${totalLepasLimit}\nMasih Limit : ${totalMasihLimit}\nDitinjau : ${totalDitinjau}`, reply_id);
        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    check_lepas_limit,
};