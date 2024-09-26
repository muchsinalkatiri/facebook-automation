const puppeteer = require("puppeteer");
const fs = require("fs");
const { parseCookieData, transformCookies } = require("./helpers/cookies");
const konfirmasiTeman = require("./rawat/konfirmasiTeman");
const like = require("./rawat/like");
const marketplace = require("./rawat/marketplace");
const saranTeman = require("./rawat/saranTeman");
const bukaNotif = require("./rawat/bukaNotif");
const lihatVideo = require("./rawat/lihatVideo");
const lihatArtikel = require("./rawat/lihatArtikel");
const buatPosting = require("./rawat/buatPosting");
const lihatStory = require("./rawat/lihatStory");
const searchTeman = require("./rawat/searchTeman");
const tambahTemanBylink = require("./rawat/tambahTemanBylink");
const chatOrang = require("./rawat/chatOrang");
const chatTemanOnline = require("./rawat/chatTemanOnline");

const { tutupObrolan, isLogin, isCp, isMp, isLimit, listAccount, cookiesPath, updateListAccount, updateJson } = require("./helpers/facebook")

const { send } = require("./helpers/telegram");

function rawat(mp="all", limit="all") {
    (async () => {
        const log = console.log;
        const list_account = await listAccount('all', 'aktif', mp, limit);

        let cp = 0;
        const startTime = getCurrentDate() + " " + getCurrentTime();
        const startTime1 = new Date();

        const sendTelegram = await send(
            `🟡[START] RAWAT AKUN`
        );
        const reply_id = sendTelegram.result.message_id;

        const browser = await puppeteer.launch({
            headless: false,
            // slowMo: 100,
            defaultViewport: null,
            args: ["--start-maximized"],
            devtools: false,
        });

        const postingAcak = [
            async (page) => {
                    console.log("lihatVideo like");
                    await lihatVideo(page, "like");
                },
                async (page) => {
                        console.log("lihatVideo comment");
                        await lihatVideo(page, "comment");
                    },
                    async (page) => {
                            console.log("lihatArtikel like");
                            await lihatArtikel(page, "like");
                        },
                        async (page) => {
                                console.log("lihatArtikel comment");
                                await lihatArtikel(page, "comment");
                            },
                            async (page) => {
                                console.log("buat posting");
                                await buatPosting(page);
                            },
        ];
        const rawatAcak = [
            async (page) => {
                    console.log("saran teman");
                    await saranTeman(page);
                },
                async (page) => {
                        console.log("scroll mp + click");
                        await marketplace(page);
                    },
                    async (page) => {
                            console.log("buka notif");
                            await bukaNotif(page);
                        },
                        async (page) => {
                                console.log("lihatStory");
                                await lihatStory(page);
                            },
                            async (page) => {
                                    console.log("search teman");
                                    await searchTeman(page);
                                },
                                async (page) => {
                                    console.log("chat Orang");
                                    await chatOrang(page);
                                },
        ];
        const wajibAcak = [
            async (page) => {
                    console.log("konfirmasi teman");
                    await konfirmasiTeman(page);
                },
                async (page) => {
                        console.log("tambah teman bylink");
                        await tambahTemanBylink(page);
                    },
                    async (page) => {
                        console.log("chat teman online");
                        await chatTemanOnline(page);
                    },
        ];

        for (let i = 0; i < list_account.length; i++) {
            let page = await browser.newPage();
            try {
                let account = list_account[i];
                const namaAkun = account['Nama Akun'];
                log(namaAkun)
                const fileName = `${cookiesPath}/${account['Nama Project']}/${namaAkun}/${namaAkun}.json`
                if (!fs.existsSync(fileName)) {
                    log(chalk.red(`[COOKIE TIDAK ADA] ${namaAkun}`));
                    continue;
                }

                const cookie = JSON.parse(fs.readFileSync(fileName));

                const r = Math.floor(Math.random() * rawatAcak.length);
                const r2 = Math.floor(Math.random() * postingAcak.length);
                // const r = 0;
                // const r2 = 3;

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

                // Acak urutan fungsi
                const randomOrder = wajibAcak.sort(() => Math.random() - 0.5);
                // Jalankan fungsi-fungsi sesuai urutan acak
                for (const func of randomOrder) {
                    await page.goto("https://facebook.com/", {
                        waitUntil: ["load"],
                        timeout: 50000,
                    });
                    await func(page);
                }

                await page.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });
                await rawatAcak[r](page);


                await page.goto("https://facebook.com/", {
                    waitUntil: ["load"],
                    timeout: 50000,
                });
                await postingAcak[r2](page);

                await updateJson(await page.cookies(), fileName)
                // break;
            } catch (e) {
                console.log(e.message)
            }finally{
                await page.deleteCookie();
                await page.close();
            }
        }
        await browser.close();
        const endTime = getCurrentDate() + " " + getCurrentTime();
        const endTime1 = new Date();

        const totalMilliseconds = endTime1 - startTime1;
        const totalMinutes = Math.round(totalMilliseconds / (1000 * 60));

        await send(
            `🟢[LAPORAN] RAWAT AKUN :\n\nStart : ${startTime}\nEnd : ${endTime}\nTotal Time : ${totalMinutes} Menit\nTotal Akun : 
      }\nTotal CP : ${cp}`,
            reply_id
        );
    })().catch((err) => console.error(err));
}

module.exports = {
    rawat,
};

function getCurrentDate() {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    return `${dayName}, ${date}-${month}-${year}`;
}

function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
}