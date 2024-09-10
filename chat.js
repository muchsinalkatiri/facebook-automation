const fs = require("fs");
const { parseCookieData } = require("./helpers/cookies");
const puppeteer = require("puppeteer");
const readline = require("readline");
let {cookiesPath} = require("./helpers/facebook");


(async () => {
    const args = process.argv.slice(2);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const folder = args[0];
    let akun = await new Promise((resolve) => {
        rl.question("Masukkan Nama: ", (input) => {
            resolve(input);
        });
    });


    if (!akun) {
        console.log("akun tidak ditulis. Program akan berhenti.");
        process.exit(1); // Keluar dengan kode error
    }

    if (folder) {
        cookiesPath = `${cookiesPath}/${folder}`;
    }



    const fileName = fs.readdirSync(cookiesPath);

    const akunArr = []
    // console.log(fileNames);
    for (const element of fileName) {
        if (element.startsWith(akun)) {
            akunArr.push(element);
        }
    }

    if (akunArr.length > 1) {
        console.log("nama akun lebih dari satu. Masukan yang lebih spesifik");
        process.exit(1); // Keluar dengan kode error
    } else if (akunArr.length == 0) {
        console.log("nama akun tidak ditemukan");
        process.exit(1); // Keluar dengan kode error
    }
    akun = akunArr[0];
    console.log(akun);


    const folderPath = `${cookiesPath}/${akun}/${akun}.json`
    if (!fs.existsSync(folderPath)) {
        console.log("file not exsist")
        return
    }

    const cookie = JSON.parse(fs.readFileSync(folderPath));

    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        defaultViewport: null,
        args: ["--start-maximized"],
        devtools: false,
    });

    const page = await browser.newPage();

    await page.setCookie(...cookie);

    await page.goto("https://www.facebook.com/marketplace/inbox", {
        waitUntil: ["load"],
        timeout: 50000,
    });

})().catch((err) => console.error(err));