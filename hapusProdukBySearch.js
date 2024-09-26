const fs = require("fs");
const puppeteer = require("puppeteer");
const csv = require("csv-parser");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const readline = require("readline");
const { send } = require("./helpers/telegram");
const { tutupObrolan, isLogin, isCp, isMp, isLimit, listAccount, cookiesPath, updateListAccount } = require("./helpers/facebook");



// Baca isi direktori
// let file_cookies = [];
(async () => {
    const log = console.log;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let search = await new Promise((resolve) => {
        rl.question("Masukkan kata kunci (all): ", (input) => {
            resolve(input);
        });
    });

    const list_account = await listAccount('sh', 'all', 'all', 'all');

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

    for (let i = 0; i < list_account.length; i++) {
        let account = list_account[i];
        const namaAkun = account['Nama Akun'];
        log(namaAkun)
        const fileName = `${cookiesPath}/${account['Nama Project']}/${namaAkun}/${namaAkun}.json`
        if (!fs.existsSync(fileName)) {
            log(chalk.red(`[COOKIE TIDAK ADA] ${namaAkun}`));
            continue;
        }

        const cookie = JSON.parse(fs.readFileSync(fileName));

        let page
        try {
            page = await browser.newPage();
            await page.setCookie(...cookie);

            await page.goto("https://www.facebook.com/", {
                waitUntil: ["load"],
                timeout: 50000,
            });


            await page.waitForTimeout(1000);
            await tutupObrolan(page);

            const is_login = await isLogin(page, account);
            if(!is_login){
                account['Status'] = 'Gagal Login';
                await page.deleteCookie();
                await page.close();
                await updateListAccount(account['No'], account['Nama Akun'], account);
                continue

            }else{
                account['Status'] = 'Aktif';
                await updateListAccount(account['No'], account['Nama Akun'], account);
            }

            
            await page.goto("https://www.facebook.com/marketplace/you/selling", {
                waitUntil: ["load"],
                timeout: 50000,
            });

            if(search != "all"){            
                try {
                    const searchKolom = await page.$('input[aria-label="Cari tawaran Anda"]');

                    await searchKolom.click();
                    await searchKolom.type(search);
                    await page.keyboard.press('Enter');
                    await page.waitForTimeout(5000);
                } catch (e) {}
            }

            // return;


            do {
                const button = await page.$$(`div[class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1qhmfi1 x1r1pt67 x1jdnuiz x1x99re3"]`);
                if (button.length == 0) {
                    break
                }

                
                try {
                    await button[0].click();
                    await page.waitForTimeout(3000);
                    const hapus = await page.$x(`//span[text()='Hapus tawaran']`);
                    await hapus[0].click();
                    await page.waitForTimeout(3000);
                    const hapusBtn = await page.$x("//div[@aria-label='Hapus']//span[text()='Hapus']");
    
                    if (hapusBtn.length == 0 || hapusBtn.length > 1) { //karena ada 2 versi tombol hapus
                        const hapusBtn2 = await page.$$(`div[class="x1i10hfl xjbqb8w x1ejq31n xd10rxx x1sy0etr x17r0tee x972fbf xcfux6l x1qhh985 xm0m39n x1ypdohk xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x16tdsg8 x1hl2dhg xggy1nq x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3"] div[class="x1n2onr6 x1ja2u2z x78zum5 x2lah0s xl56j7k x6s0dn4 xozqiw3 x1q0g3np xi112ho x17zwfj4 x585lrc x1403ito x972fbf xcfux6l x1qhh985 xm0m39n x9f619 xn6708d x1ye3gou xtvsq51 x1r1pt67"] div[class="x6s0dn4 x78zum5 xl56j7k x1608yet xljgi0e x1e0frkt"] div[class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s x1fbi1t2 xl8fo4v"] span[class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x6prxxf xvq8zen x1s688f xtk6v10"] span[class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft"]`); //masih belum tau jalan apa tidak
                        await hapusBtn2[0].click();

                    } else {
                        await hapusBtn[0].click();
                    }
                    total++

                    await page.waitForTimeout(5000);
                    // await page.click('div[aria-label="Tutup"]');
                    // await page.waitForTimeout(3000);

                } catch (e) {
                    console.error(e.message)
                    // break;
                }

            } while (true)
            // await page.waitForTimeout(10000); //delay 2 detik
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