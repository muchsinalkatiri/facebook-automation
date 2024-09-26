const fs = require("fs");
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const csv = require("csv-parser");
const { send } = require("./helpers/telegram");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const { tutupObrolan, isLogin, isCp, isMp, isLimit, listAccount, cookiesPath, updateListAccount, updateJson } = require("./helpers/facebook")


// Baca isi direktori
// let file_cookies = [];
function check_kondisi(folder) {
    (async () => {

        const list_account = await listAccount('sh', 'all', 'all', 'all');

        const log = console.log;
        let totalDitinjau = 0;
        let totalLepasLimit = 0;
        let totalMasihLimit = 0;
        const browser = await puppeteer.launch({
            // headless: 'new',
            headless: false,
            // slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });


        const sendTelegram = await send(`🟡[START] CHECK KONDISI AKUN}`);
        const reply_id = sendTelegram.result.message_id;

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


                await page.goto("https://facebook.com/", {
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

                const is_cp = await isCp(page, account);
                if(is_cp){
                    account['Status'] = 'Gagal Login';
                    await page.deleteCookie();
                    await page.close();
                    await updateListAccount(account['No'], account['Nama Akun'], account);
                    continue
                }else{
                    account['Status'] = 'Aktif';
                    await updateListAccount(account['No'], account['Nama Akun'], account);
                }

                
                const is_mp = await isMp(page, account);
                if(!is_mp){
                    totalDitinjau++
                    account['Akses Marketplace'] = 'Tidak Aktif';
                    await updateListAccount(account['No'], account['Nama Akun'], account);
                }else{
                    account['Akses Marketplace'] = 'Aktif';
                    await updateListAccount(account['No'], account['Nama Akun'], account);
                }

                const is_limit = await isLimit(page, account);
                if(is_limit){
                    totalMasihLimit++
                    account['Limit MP'] = 'Limit';
                    await updateListAccount(account['No'], account['Nama Akun'], account);
                }else{
                    totalLepasLimit++;
                    account['Limit MP'] = 'Lepas Limit';
                    await updateListAccount(account['No'], account['Nama Akun'], account);
                }


                await page.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });

                await updateJson(await page.cookies(), fileName)


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
        await send(`🟢[LAPORAN] CHECK KONDISI AKUN:\n\nLepas Limit : ${totalLepasLimit}\nMasih Limit : ${totalMasihLimit}\nDitinjau : ${totalDitinjau}`, reply_id);
        await browser.close();
    })().catch((err) => console.error(err));
}

module.exports = {
    check_kondisi,
};