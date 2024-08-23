const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const readline = require("readline");
const { send } = require("./helpers/telegram");


const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
(async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let search = await new Promise((resolve) => {
        rl.question("Masukkan kata kunci: ", (input) => {
            resolve(input);
        });
    });

    let total = 0;
    const sendTelegram = await send(`🟡[START] Hapus Produk ${search}`)
    const reply_id = sendTelegram.result.message_id;

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

            await page.goto("https://www.facebook.com/marketplace/you/selling", {
                waitUntil: ["load"],
                timeout: 50000,
            });

            const tutupObrolanBtn = await page.$$(`div[aria-label="Tutup obrolan"]`);
            for (const button of tutupObrolanBtn) {
                await page.waitForTimeout(3000);
                try {
                    await button.click();
                } catch (e) {}
            }

            try {
                const searchKolom = await page.$('input[aria-label="Cari tawaran Anda"]');

                await searchKolom.click();
                await searchKolom.type(search);
                await page.keyboard.press('Enter');
                await page.waitForTimeout(5000);
            } catch (e) {}


            do {
                const button = await page.$$(`div[class="x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"] div[class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1qhmfi1 x1r1pt67 x1pi30zi x1swvt13"]`);
                if (button.length == 0) {
                    break
                }
                try {
                    await button[0].click();
                    await page.waitForTimeout(3000);
                    const hapus = await page.$x(`//span[text()='Hapus Tawaran']`);
                    await hapus[0].click();
                    await page.waitForTimeout(3000);
                    const hapusBtn = await page.$$(`div[class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xdl72j9"] div[class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xn6708d x1ye3gou xtvsq51 x1r1pt67"] div[class="x6s0dn4 x78zum5 xl56j7k x1608yet xljgi0e x1e0frkt"]`);
                    if (hapusBtn.length == 0) { //karena ada 2 versi tombol hapus
                        const hapusBtn2 = await page.$$(`div[class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xbxaen2 x1u72gb5 xtvsq51 x1r1pt67"]`);
                        await hapusBtn2[0].click();
                        await page.waitForTimeout(3000);

                    } else {
                        await hapusBtn[0].click();
                        await page.waitForTimeout(3000);
                    }
                    total++

                    await page.click('div[aria-label="Tutup"]');
                    await page.waitForTimeout(3000);

                } catch (e) {
                    console.error(e.message)
                    // break;
                }
            } while (true)
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
    await send(`🟢[LAPORAN] Hapus Produk ${search}\n Total : ${total}`, reply_id)

    await browser.close();
})().catch((err) => console.error(err));