const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { send } = require("./helpers/telegram");


// const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai

// Baca isi direktori
// let file_cookies = [];
(async () => {
    const fileName = fs.readdirSync(folderPath);
    const fileNames = fileName.filter((filenam) => filenam.endsWith(".csv"));
    let total = 0



    const sendTelegram = await send(`🟡[START] Rubah Nama`)
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
        // console.log(cookie);
        // return;

        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });
        const page = await browser.newPage();

        await page.setCookie(...cookie);

        await page.goto("https://www.facebook.com/profile", {
            waitUntil: ["load"],
            timeout: 50000,
        });

        if (page.url().includes("checkpoint")) {
            console.log("checkpoint");
            await browser.close();
            continue;
        }

        let data = [];
        let nama;
        let uid;
        let email;
        let pass;

        //nama
        try {
            nama = await page.$eval(
                'div[role="main"] span[dir="auto"] h1',
                (el) => el.outerText.trim());
        } catch (e) {
            nama = "error";
            console.error(e);
        }
        data.push({ nama: nama.replace(/\s+/g, '_') });

        //uid
        try {
            uid = page.url().split('=')[1];
        } catch (e) {
            uid = "error";
            console.error(e);
        }
        data.push({ uid });

        //email
        try {
            await page.goto("https://accountscenter.facebook.com/personal_info", {
                waitUntil: ["load"],
                timeout: 50000,
            });

            email = await page.$eval(
                'div a[href="/personal_info/contact_points/"]',
                (el) => el.ariaLabel.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)[0]
            );
        } catch (e) {
            email = "error";
            console.error(e);
        }
        data.push({ email });

        //pass
        if (fileNames[i].startsWith('0')) {
            pass = 'akunfb.id';
        } else if (fileNames[i].startsWith('1')) {
            pass = 'Muchsin3011';
        }
        data.push({ pass });


        const namaFileBaru = data.map(obj => Object.values(obj)[0]).join('#');
        console.log(namaFileBaru)

        const cookiesObject = await page.cookies();
        const transformedData = await transformCookies(cookiesObject);

        await fs.writeFileSync(`${folderPath}/new/${namaFileBaru}.csv`, transformedData);

        await browser.close();
        total++
        continue;
    }

    await send(`🟢[LAPORAN] Rubah Nama\n Total : ${total}`, reply_id)
})().catch((err) => console.error(err));

function parseCookieData(cookieData) {
    const cookieArray = cookieData.split("\n");
    const jsonResult = [];

    cookieArray.forEach((cookie) => {
        if (cookie.trim() !== "") {
            const [name, value, domain, path] = cookie.split(",");
            const cookieObject = {
                name: name,
                value: value,
                domain: domain,
                path: path.replace("\r", ""),
            };
            jsonResult.push(cookieObject);
        }
    });

    return jsonResult;
}

function transformCookies(cookies) {
    const transformedCookies = cookies.map((cookie) => {
        const { name, value, domain, path } = cookie;
        return `${name},${value},${domain},${path}`;
    });

    return transformedCookies.join("\n");
}