const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { send } = require("./helpers/telegram");
const mpByLink = require("./rawat/mpByLink");
const { tutupObrolan, belumLogin, checkpoint, tinjauan } = require("./helpers/facebook")

// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai
// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai

const folderCp = "Cookies/cp"; // Gantilah dengan path folder yang sesuai
const folderTinjauan = "Cookies/tinjauan"; // Gantilah dengan path folder yang sesuai



// Baca isi direktori
// let file_cookies = [];
function check(folderPath = "Cookies", tipe) {
    (async () => {
        send(`🔵[FB CHECK] start check, jam : ${new Date().getHours()}`)
        const pesanJson = JSON.parse(fs.readFileSync(`pesan.json`));

        do {
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
                // console.log(dtArray);
                // return;


                let page
                try {
                    page = await browser.newPage();

                    await page.setCookie(...cookie);

                    await page.goto("https://facebook.com/", {
                        waitUntil: ["load"],
                        timeout: 50000,
                    });


                    await page.waitForTimeout(5000);
                    await tutupObrolan(page);

                    await belumLogin(page, dt);


                    if (await checkpoint(page, dt, folderPath, folderCp, fileNames[i])) {
                        await page.deleteCookie();
                        await page.close();
                        continue
                    }

                    await mpByLink(page, dt[1]);


                    //check pesan MP
                    await page.goto("https://www.facebook.com/marketplace/inbox", {
                        waitUntil: ["load"],
                        timeout: 50000,
                    });



                    let nama = "";

                    do {
                        const pesanSelector = await page.$$(`div[class="x1lq5wgf xgqcy7u x30kzoy x9jhf4c xdk7pt x1xc55vz xwnonoy"]`);
                        // const pesanSelector = await page.$$(`div[class="x1lq5wgf xgqcy7u x30kzoy x9jhf4c x1lliihq"]`);
                        if (pesanSelector.length > 0) {
                            try {
                                await page.waitForTimeout(5000);
                                await pesanSelector[0].click();
                                await page.waitForTimeout(5000);

                                nama = await page.$eval(
                                    'div[aria-label^="Pengaturan"] h2',
                                    (el) => el.textContent
                                );
                                nama = nama.toLowerCase().split(' ')[0];
                                // console.log(nama)

                                const linkProduk = await page.$('a[class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1q0g3np x87ps6o x1lku1pv x1rg5ohu x1a2a7pz xh8yej3"]');
                                const produkHref = await page.evaluate(anchor => anchor.getAttribute('href'), linkProduk);
                                // console.log(produkHref);


                                const page2 = await browser.newPage();
                                await page2.goto(produkHref, {
                                    waitUntil: ["load"],
                                    timeout: 50000,
                                });

                                let namaProduk = await page2.$eval(
                                    'div[role="main"] div h1 span',
                                    (el) => el.innerText
                                );

                                await page2.close()


                                let pesanJ = [];
                                for (let i = 0; i < pesanJson.length; i++) {
                                    if (namaProduk.toLowerCase().includes(pesanJson[i].barang)) {
                                        pesanJ = pesanJson[i];
                                        break
                                    }
                                }


                                if (pesanJ.length === 0) { //jika barang tidak ada di pesan.json
                                    const pesanCust = await page.$$('div[class="html-div xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x6ikm8r x10wlt62"]')
                                    const lastElement = pesanCust[pesanCust.length - 1];

                                    const pesanCustTerakhir = await lastElement.evaluate(element => element.innerText);
                                    send(`Chat FBMP : ${dt[0]} \nPesan : ${pesanCustTerakhir} `)
                                    break;
                                }

                                const pesan = pesanJ.pesan[Math.floor(Math.random() * pesanJ.pesan.length)].replaceAll("[nama]", nama).replaceAll("[no]", pesanJ.nomer)
                                const pesan2 = pesanJ.pesan2.replace("[nama]", nama).replace("[no]", pesanJ.nomer.replaceAll("-", "").replace("08", "628"))

                                const pesanSebelumnya = await page.$$('div[class="x1gslohp x11i5rnm x12nagc x1mh8g0r x1yc453h x126k92a xyk4ms5"]')

                                // console.log(pesanSebelumnya.length)

                                if (pesanSebelumnya.length == 0) {
                                    await page.keyboard.type(pesan, { delay: 100 });
                                    await page.keyboard.press('Enter');
                                } else if (pesanSebelumnya.length == 1) {
                                    await page.keyboard.type(pesan2, { delay: 100 });
                                    await page.keyboard.press('Enter');
                                } else {
                                    const pesanCust = await page.$$('div[class="html-div xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x6ikm8r x10wlt62"]')
                                    const lastElement = pesanCust[pesanCust.length - 1];

                                    const pesanCustTerakhir = await lastElement.evaluate(element => element.innerText);

                                    send(`⚪️Chat FBMP : ${dt[0]} \nProduk : ${pesanJ.barang} \nPesan : ${pesanCustTerakhir} `)
                                }
                                // console.log(pesan2)

                                await page.waitForTimeout(3000);
                                await tutupObrolan(page);


                            } catch (e) {
                                console.log(e.message)
                                send(`⚫️Chat FBMP : ${dt[0]}`)
                                break;
                            }
                        } else {
                            break;
                        }
                    }
                    while (true)

                    // if ((await page.$('div[class="x1lq5wgf xgqcy7u x30kzoy x9jhf4c xdk7pt x1xc55vz xwnonoy"]')) !== null) {
                    //     send(`Chat FBMP : ${dt[0]}`)
                    // }
                    if (await tinjauan(page, dt, folderPath, folderTinjauan, fileNames[i])) {
                        continue
                    }

                } catch (e) {
                    console.log(e.message)
                    await page.deleteCookie();
                    await page.close();
                    continue
                }


                // await page.waitForTimeout(10000); //delay 2 detik
                const cookiesObject = await page.cookies();
                const transformedData = await transformCookies(cookiesObject);

                fs.writeFileSync(`${folderPath}/${fileNames[i]}`, transformedData);
                await page.waitForTimeout(5000);

                await page.deleteCookie();
                await page.close();

                const jamIstirahat = [8, 11, 14, 17, 22];

                if (jamIstirahat.includes(new Date().getHours())) {
                    console.log("[FB CHECK] istirahat dulu")
                    send(`🟠[FB CHECK] istirahat check, jam ${new Date().getHours()}`)
                    await browser.close();
                    return;
                }

                continue;
            }
            await browser.close();

            if (tipe == "noloop") {
                send(`🟠[FB CHECK] Selesai Check Noloop`)
                return;
            }
        }
        while (true)
    })().catch((err) => console.error(err));
}

module.exports = {
    check,
};

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