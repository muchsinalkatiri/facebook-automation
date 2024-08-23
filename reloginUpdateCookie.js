const fs = require("fs");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const puppeteer = require("puppeteer");
const readline = require("readline");



(async () => {
    // const args = process.argv.slice(2);
    // let akun = args[0];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let akun = await new Promise((resolve) => {
        rl.question("Masukkan Nama: ", (input) => {
            resolve(input);
        });
    });

    akun = akun
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('_');

    const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
    // const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai

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

    const csvContent = await fs.readFileSync(
        `${folderPath}/${akun}`,
        "utf-8"
    );
    const cookie = await parseCookieData(csvContent);
    const dt = akun.replace('.csv', '').split('#');


    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        defaultViewport: null,
        args: ["--start-maximized"],
        devtools: false,
    });

    const page = await browser.newPage();

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
            await page.type("#email", dt[1]);
            await page.type("#pass", dt[3]);
            await page.click(
                'button[name="login"][type="submit"]'
            );
            await page.waitForNavigation({
                waitUntil: ["load"],
            });
        }
    } else {
        // console.log("sudah login");
    }

    if (page.url().includes("checkpoint")) {
        console.log("checkpoint");
        send(`CP : ${dt[0]}`)
        await page.deleteCookie();
        await page.close();
        await fs.rename(
            `${folderPath}/${akun}`,
            `${folderPath}/cp/${akun}`,
            (err) => {
                if (err) {
                    console.error("Error moving file:", err);
                } else {
                    console.log("File moved successfully!");
                }
            }
        );
    }
    // await page.waitForTimeout(10000); //delay 2 detik
    const cookiesObject = await page.cookies();
    const transformedData = await transformCookies(cookiesObject);

    fs.writeFileSync(`${folderPath}/${akun}`, transformedData);
    await page.waitForTimeout(5000);

    await page.deleteCookie();
    await page.close();
    await browser.close();

    process.exit();


})().catch((err) => console.error(err));