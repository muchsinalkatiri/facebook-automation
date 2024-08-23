const fs = require("fs");
const { parseCookieData } = require("./helpers/cookies");
const puppeteer = require("puppeteer");
const readline = require("readline");



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

    akun = akun
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_');

    let folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
    // let folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai

    if (folder) {
        folderPath = `${folderPath}/${folder}`;
    }



    const fileName = fs.readdirSync(folderPath);
    const fileNames = fileName.filter((filename) => filename.endsWith(".csv"));



    if (!akun) {
        console.log("akun tidak ditulis. Program akan berhenti.");
        process.exit(1); // Keluar dengan kode error
    }

    akun = akun.charAt(0).toUpperCase() + akun.slice(1);
    // console.log(akun)
    // return

    const akunArr = []
    // console.log(fileNames);
    for (const element of fileNames) {
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


    if (!fs.existsSync(`${folderPath}/${akun}`)) {
        console.log("file not exsist")
        return
    }
    const csvContent = await fs.readFileSync(
        `${folderPath}/${akun}`,
        "utf-8"
    );
    const cookie = await parseCookieData(csvContent);

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