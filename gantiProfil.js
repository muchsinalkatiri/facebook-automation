const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");



// const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
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
    const sampulFile = fs.readdirSync(sampulPath);


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
        // console.log(dtArray);
        // return;


        const page = await browser.newPage();

        await page.setCookie(...cookie);

        await page.goto("https://www.facebook.com/profile", {
            waitUntil: ["load"],
            timeout: 50000,
        });

        if (page.url().includes("checkpoint")) {
            console.log("checkpoint");
            continue;
        }

        try {
            await page.click('div[aria-label="Update Foto Profil"]');
            await page.waitForTimeout(2000);

            const inputFoto = await page.$$('input[accept="image/*,image/heif,image/heic"][type="file"]');

            const filePath = `${imagePath}/${ppFile[i]}`;

            if (inputFoto) {
                await inputFoto[1].uploadFile(filePath);
                await page.waitForTimeout(6000);
            } else {
                console.log('File input not found');
            }
            await page.waitForFunction(
                (inputFoto) => {
                    return inputFoto.value !== '';
                }, {},
                inputFoto
            );

            await page.click('div[aria-label="Simpan"]');
            await page.waitForTimeout(5000);


        } catch (e) {
            console.log(e.message)
        }

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

        try {
            await page.click(`a[href="${page.url()}&sk=photos"]`);
            await page.waitForTimeout(2000);
            const galeri = await page.$$(`div[style^="margin"] a[href^="http"][role="link"][tabindex="0"] img[referrerpolicy="origin-when-cross-origin"][src^="http"]`);

            await galeri[galeri.length - 1].click();
            await page.waitForTimeout(2000);
            await page.click(`div[aria-label="Tindakan untuk postingan ini"]`);
            await page.waitForTimeout(2000);

            const hapus = await page.$x(`//span[text()='Hapus Foto']`);
            await hapus[0].click();
            await page.waitForTimeout(2000);
            await page.click(`div[class="x9f619 x1n2onr6 x1ja2u2z x78zum5 x2lah0s x1qughib x1qjc9v5 xozqiw3 x1q0g3np xn6708d x1ye3gou xyamay9 xcud41i x139jcc6 x4vbgl9 x1rdy4ex"] div[class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1iyjqo2 xs83m0k x150jy0e x1e558r4 xjkvuk6 x1iorvi4 xdl72j9"] div[class="x1i10hfl xjbqb8w x6umtig x1b1mbwd xaqea5y xav7gou x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"] span[class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen x1s688f xtk6v10"] span[class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft"]`);
            await page.waitForTimeout(5000);




        } catch (e) {
            console.log(e.message);
        }


        // await page.waitForTimeout(10000); //delay 2 detik
        const cookiesObject = await page.cookies();
        const transformedData = transformCookies(cookiesObject);

        await fs.writeFileSync(`${folderPath}/${fileNames[i]}`, transformedData);

        await page.deleteCookie();
        await page.close();
        continue;
    }
    await browser.close();
})().catch((err) => console.error(err));