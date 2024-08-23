const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { send } = require("./helpers/telegram");




// const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies/tinjauan"; // Gantilah dengan path folder yang sesuai
const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai

const imagePath = "./random/pp"; // Gantilah dengan path folder yang sesuai
const sampulPath = "./random/sampul"; // Gantilah dengan path folder yang sesuai

// Baca isi direktori
// let file_cookies = [];
(async () => {
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
    const ppFile = fs.readdirSync(imagePath);

    let iSampul = 0;
    let total = 0

    // send(`🟡[START] Lengkapi Profil`)
    const sendTelegram = await send(`🟡[START] Lengkapi Profil`);
    const reply_id = sendTelegram.result.message_id;

    for (let i = 0; i < fileNames.length; i++) {
        const sampulFile = fs.readdirSync(sampulPath);
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
        // console.log(dtArray);
        // return;

        let page
        try {
            page = await browser.newPage();

            await page.setCookie(...cookie);

            await page.goto("https://www.facebook.com", {
                waitUntil: ["load"],
                timeout: 50000,
            });

            if (page.url().includes("checkpoint")) {
                console.log("checkpoint");
                continue;
            }


            //lengkapi profil tempat kerja
            await page.goto(`https://www.facebook.com/profile.php?id=${dt[1]}&sk=about`, {
                waitUntil: ["load"],
                timeout: 50000,
            });

            try {

                const tambahKerjaBtn = await page.$x(`//span[text()='Tambahkan tempat kerja']`);
                await tambahKerjaBtn[0].click();

                const listTempatKerja = JSON.parse(fs.readFileSync(`./random/tempatKerja.json`));
                const tempat_kerja = listTempatKerja[Math.floor(Math.random() * listTempatKerja.length)];
                await page.waitForTimeout(3000);
                await page.type('input[aria-label="Perusahaan"]', tempat_kerja);
                await page.waitForTimeout(3000);
                const listFb = await page.$$(`ul[role="listbox"] li`);
                await listFb[0].click();
                await page.waitForTimeout(3000);

                const listJabatan = JSON.parse(fs.readFileSync(`./random/jabatanKerja.json`));
                const jabatan = listJabatan[Math.floor(Math.random() * listJabatan.length)];
                await page.type('input[aria-label="Jabatan"]', jabatan);
                await page.waitForTimeout(3000);
                const listJabatanFb = await page.$$(`ul[role="listbox"] li`);
                await listJabatanFb[0].click();
                await page.waitForTimeout(3000);

                const listKota = JSON.parse(fs.readFileSync(`./random/kota.json`));
                const kota = listKota[Math.floor(Math.random() * listKota.length)];
                await page.type('input[aria-label="Kota/Daerah"]', kota);
                await page.waitForTimeout(3000);
                const listKotafb = await page.$$(`ul[role="listbox"] li`);
                await listKotafb[0].click();
                await page.waitForTimeout(3000);

                await page.click('div[aria-label="Simpan"]');
                await page.waitForTimeout(9000);

                iSampul++;
            } catch (e) {
                console.log(e.message);
            }

            //lengkapi profil kota sekarang
            await page.goto(`https://www.facebook.com/profile.php?id=${dt[1]}&sk=about`, {
                waitUntil: ["load"],
                timeout: 50000,
            });

            try {

                const tambahkanKotaSekarangBtn = await page.$x(`//span[text()='Tambahkan kota sekarang']`);
                await tambahkanKotaSekarangBtn[0].click();
                await page.waitForTimeout(3000);


                const listKota = JSON.parse(fs.readFileSync(`./random/kota.json`));
                const kota = listKota[Math.floor(Math.random() * listKota.length)];
                await page.type('input[aria-label="Kota Saat Ini"]', kota);
                await page.waitForTimeout(3000);
                const listKotafb = await page.$$(`ul[role="listbox"] li`);
                await listKotafb[0].click();
                await page.waitForTimeout(3000);

                await page.click('div[aria-label="Simpan"]');
                await page.waitForTimeout(9000);

                iSampul++;
            } catch (e) {
                console.log(e.message);
            }

            //lengkapi profil kota asal
            await page.goto(`https://www.facebook.com/profile.php?id=${dt[1]}&sk=about`, {
                waitUntil: ["load"],
                timeout: 50000,
            });

            try {

                const tambahkanKotaSekarangBtn = await page.$x(`//span[text()='Tambahkan kota asal']`);
                await tambahkanKotaSekarangBtn[0].click();
                await page.waitForTimeout(3000);


                const listKota = JSON.parse(fs.readFileSync(`./random/kota.json`));
                const kota = listKota[Math.floor(Math.random() * listKota.length)];
                await page.type('input[aria-label="Kota asal"]', kota);
                await page.waitForTimeout(3000);
                const listKotafb = await page.$$(`ul[role="listbox"] li`);
                await listKotafb[0].click();
                await page.waitForTimeout(3000);

                await page.click('div[aria-label="Simpan"]');
                await page.waitForTimeout(9000);

                iSampul++;
            } catch (e) {
                console.log(e.message);
            }

            //lengkapi profil SMA
            await page.goto(`https://www.facebook.com/profile.php?id=${dt[1]}&sk=about`, {
                waitUntil: ["load"],
                timeout: 50000,
            });

            try {

                const tambahkanSmaBtn = await page.$x(`//span[text()='Tambahkan SMA']`);
                await tambahkanSmaBtn[0].click();
                await page.waitForTimeout(3000);


                const listSma = JSON.parse(fs.readFileSync(`./random/sma.json`));
                const sma = listSma[Math.floor(Math.random() * listSma.length)];
                await page.type('input[aria-label="Sekolah"]', sma);
                await page.waitForTimeout(3000);
                const listSmafb = await page.$$(`ul[role="listbox"] li`);
                await listSmafb[0].click();
                await page.waitForTimeout(3000);

                await page.click('div[aria-label="Simpan"]');
                await page.waitForTimeout(9000);

                iSampul++;
            } catch (e) {
                console.log(e.message);
            }

            //ganti sampul
            if (iSampul != 0) {
                await page.goto("https://www.facebook.com/profile", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                try {
                    const inputSampul = await page.$$('input[accept="image/*,image/heif,image/heic"][type="file"]');

                    const randomIndex = Math.floor(Math.random() * (sampulFile.length - 1));

                    const filePath2 = `${sampulPath}/${sampulFile[randomIndex]}`;
                    console.log(filePath2);

                    if (inputSampul) {
                        await inputSampul[0].uploadFile(filePath2);
                        await page.waitForTimeout(6000);
                    } else {
                        console.log('File input not found');
                    }
                    await page.waitForFunction(
                        (inputSampul) => {
                            return inputSampul.value !== '';
                        }, {},
                        inputSampul
                    );

                    await page.click('div[aria-label="Simpan perubahan"][role="button"][tabindex="0"]');
                    await page.waitForTimeout(5000);


                } catch (e) {
                    console.log(e.message);
                }
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
        total++
        continue;
    }

    await send(`🟢[LAPORAN] Lengkapi profil\n Total:${total}`, reply_id);
    await browser.close();
})().catch((err) => console.error(err));