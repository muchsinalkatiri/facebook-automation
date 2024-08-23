const puppeteer = require("puppeteer");
const fs = require("fs");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const konfirmasiTeman = require("./rawat/konfirmasiTeman");
const bukaNotif = require("./rawat/bukaNotif");
const lihatVideo = require("./rawat/lihatVideo");

const { send } = require("./helpers/telegram");

// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai
const folderCp = "C:/Users/Administrator/Documents/fbmp/Cookies/cp"; // Gantilah dengan path folder yang sesuai

function rawatTinjauan(
    folderPath = "C:/Users/Administrator/Documents/fbmp/tinjauan/Cookies"
) {
    (async () => {
        let cp = 0;
        const startTime = getCurrentDate() + " " + getCurrentTime();
        const startTime1 = new Date();
        const fileName = fs.readdirSync(folderPath);
        const fileNames = fileName.filter((filenam) => filenam.endsWith(".csv"));

        const pathSegments = folderPath.split(/\\|\//);
        let lastFolder;
        if (folderPath.includes("tinjauan")) {
            lastFolder = "tinjauan";
        } else {
            lastFolder = pathSegments[pathSegments.length - 1];
        }

        const sendTelegram = await send(
            `🟡[START] RAWAT AKUN FOLDER ${lastFolder.toUpperCase()}`
        );
        const reply_id = sendTelegram.result.message_id;

        const browser = await puppeteer.launch({
            headless: false,
            // slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });

        const wajibAcak = [
            async (page) => {
                console.log("konfirmasi teman");
                await konfirmasiTeman(page);
            },

        ];

        const postingAcak = [
            async (page) => {
                    console.log("lihatVideo like");
                    await lihatVideo(page, "like");
                },
                async (page) => {
                    console.log("buka notif");
                    await bukaNotif(page);
                },
        ]

        for (let i = 0; i < fileNames.length; i++) {
            let page = await browser.newPage();
            try {
                console.log(fileNames[i]);
                if (!fs.existsSync(`${folderPath}/${fileNames[i]}`)) {
                    continue;
                }
                const dt = fileNames[i].replace(".csv", "").split("#");

                const csvContent = fs.readFileSync(
                    `${folderPath}/${fileNames[i]}`,
                    "utf-8"
                );
                const cookie = parseCookieData(csvContent);

                // const r = 0;
                // const r2 = 3;

                await page.setCookie(...cookie);

                await page.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                if ((await page.$('input[id="email"]')) !== null) {
                    //jika belum login
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
                        await page.type("#email", dt[1]);
                        await page.type("#pass", dt[3]);
                        await page.click('button[name="login"][type="submit"]');
                        await page.waitForNavigation({
                            waitUntil: ["load"],
                        });
                    }
                } else {
                    //berhasil login
                }

                if (page.url().includes("checkpoint")) {
                    console.log("checkpoint");
                    send(`🔴CP : ${dt[0]}`);
                    await page.deleteCookie();
                    await page.close();
                    fs.rename(
                        `${folderPath}/${fileNames[i]}`,
                        `${folderCp}/${fileNames[i]}`,
                        (err) => {
                            if (err) {
                                console.error("Error moving file:", err);
                            } else {
                                console.log("File moved successfully!");
                            }
                        }
                    );
                    cp++;
                    continue;
                }

                const tutupObrolanBtn = await page.$$(
                    `div[aria-label="Tutup obrolan"]`
                );
                for (const button of tutupObrolanBtn) {
                    try {
                        const hoverBtn = await page.$$(
                            `div[class="x14yjl9h xudhj91 x18nykt9 xww2gxu x1qeybcx x19xcq9t xpz12be x4b6v7d x10e4vud x1v7wizp xxjl4ni x84okpw"]`
                        );
                        if (hoverBtn.length > 0) {
                            for (const chatBtn of hoverBtn) {
                                await chatBtn.hover();
                                await page.waitForTimeout(1000);

                                await button.click();
                            }
                        } else {
                            await page.waitForTimeout(1000);

                            await button.click();
                        }
                    } catch (e) {}
                }

                // Acak urutan fungsi
                const randomOrder = wajibAcak.sort(() => Math.random() - 0.5);
                // Jalankan fungsi-fungsi sesuai urutan acak
                for (const func of randomOrder) {
                    await page.goto("https://facebook.com/", {
                        waitUntil: ["load"],
                        timeout: 50000,
                    });
                    await func(page);
                }


                await page.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });
                await postingAcak[Math.floor(Math.random() * postingAcak.length)](page);

                // await page.waitForTimeout(10000); //delay 2 detik
                const cookiesObject = await page.cookies();
                const transformedData = await transformCookies(cookiesObject);

                await fs.writeFileSync(
                    `${folderPath}/${fileNames[i]}`,
                    transformedData
                );
                // break;
            } catch (e) {
                console.log(e.message);
                await page.deleteCookie();
                await page.close();
                continue;
            }
            await page.deleteCookie();
            await page.close();
        }
        await browser.close();
        const endTime = getCurrentDate() + " " + getCurrentTime();
        const endTime1 = new Date();

        const totalMilliseconds = endTime1 - startTime1;
        const totalMinutes = Math.round(totalMilliseconds / (1000 * 60));

        await send(
            `🟢[LAPORAN] RAWAT AKUN FOLDER ${lastFolder.toUpperCase()}:\n\nStart : ${startTime}\nEnd : ${endTime}\nTotal Time : ${totalMinutes} Menit\nTotal Akun : ${
        fileNames.length
      }\nTotal CP : ${cp}`,
            reply_id
        );
    })().catch((err) => console.error(err));
}

module.exports = {
    rawatTinjauan,
};

function getCurrentDate() {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    return `${dayName}, ${date}-${month}-${year}`;
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}