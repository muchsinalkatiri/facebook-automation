const { send } = require("../helpers/telegram");
const fs = require("fs");
const { csvToJson } = require("../helpers/global");
const csvWriter = require('csv-writer').createObjectCsvWriter;
const chalk = require("chalk");

const cookiesMaster = "C:/ROBOT FB UNDERGROUND 2024/Data/FB Account Manager/FB Account Manager.csv"
const cookiesPath = "C:/ROBOT FB UNDERGROUND 2024/Data/Cookies"

const log = console.log;


const listAccount = async function(projek, status=null, mp=null, limit=null){
    let list_account = await csvToJson(`${cookiesMaster}`)
    if(projek != "all"){
        list_account = list_account.filter(account => account['Nama Project'] === projek);
    }

    if(status != 'all' && status == "aktif"){
        list_account = list_account.filter(account => account['Status'] == "Aktif");
    }else if(status != 'all' && status=="tidak aktif"){
        list_account = list_account.filter(account => account['Status'] == "Tidak Aktif");
    }

    if(mp != 'all' && mp == "aktif"){
        list_account = list_account.filter(account => account['Akses Marketplace'] == "Aktif");
    }else if(mp != 'all' && mp=="tidak aktif"){
        list_account = list_account.filter(account => account['Akses Marketplace'] == "Tidak Aktif");
    }

    if(limit != 'all' &&  limit == "lepas limit"){
        list_account = list_account.filter(account => account['Limit MP'] == "Lepas Limit");
    }else if(limit != 'all' && limit=="limit"){
        list_account = list_account.filter(account => account['Limit MP'] == "Limit");
    }
    
    return list_account
}

async function updateListAccount(nomor, nama, data) {
    const headers = [
        { id: 'Pilih', title:  'Pilih' },
        { id: 'No', title:  'No' },
        { id: 'Nama Project', title: 'Nama Project' },
        { id: 'Nama Akun', title: 'Nama Akun' },
        { id: 'UID/Email/No HP', title: 'UID/Email/No HP' },
        { id: 'Password', title:  'Password' },
        { id: 'Kode 2FA', title: 'Kode 2FA' },
        { id: 'Status', title:  'Status' },
        { id: 'Bahasa', title:  'Bahasa' },
        { id: 'Akses Marketplace', title: 'Akses Marketplace' },
        { id: 'Limit MP', title: 'Limit MP' },
        { id: 'Cookies', title:  'Cookies' },
        { id: 'Cookies Lama', title: 'Cookies Lama' },
        { id: 'UID', title:  'UID' }
    ];
    console.log('mengupdate')

    let list_account = await csvToJson(cookiesMaster);

    // Temukan index dari account yang sesuai dengan 'nomor' atau 'nama'
    const index = list_account.findIndex(account => account['No'] === nomor || account['Nama Akun'] === nama);

    if (index !== -1) {
        // Jika ditemukan, perbarui entri dengan data baru
        list_account[index] = {
            ...list_account[index],
            ...data // Merge data baru ke data lama
        };
    } else {
        console.log('Akun tidak ditemukan.');
        return false; // Keluar jika tidak ditemukan
    }

    // Tulis ulang data ke CSV
    try {
        const csvWriterInstance = csvWriter({
            path: cookiesMaster,
            header: headers
        });

        await csvWriterInstance.writeRecords(list_account); // Menulis ulang seluruh data ke CSV
        console.log('Data berhasil diperbarui.');
        return true;
    } catch (error) {
        console.error('Gagal memperbarui file CSV:', error);
        return false;
    }
}

async function tutupObrolan(page) {

    const tutupObrolanBtn = await page.$$(`div[aria-label="Tutup obrolan"]`);
    for (const button of tutupObrolanBtn) {
        try {
            console.log("tutup obrolan")
            const hoverBtn = await page.$$(`div[class="x14yjl9h xudhj91 x18nykt9 xww2gxu x1qeybcx x19xcq9t xpz12be x4b6v7d x10e4vud x1v7wizp xxjl4ni x84okpw"]`);
            if (hoverBtn.length > 0) {
                for (const chatBtn of hoverBtn) {
                    await chatBtn.hover();
                    await page.waitForTimeout(1000);

                    await button.click();
                }
            } else {
                await page.waitForTimeout(1000);

                await button.click();
            }
        } catch (e) {}
    }
};

async function isLogin(page, data) {
    const nama = data['Nama Akun'] 
    const username = data['UID/Email/No HP'] 
    const pass = data['Password'];
    if ((await page.$('input[id="email"]')) !== null) { //jika belum login
        log(chalk.yellow(`[BELUM LOGIN] ${nama}`));
        if ((await page.$("div>div>a>img")) !== null) {
            console.log("ada sesi login");
            await page.click("div>div>a>img");

            await page.type("#pass", pass);
            
            await page.click(
                'div[aria-labelledby="Log in"]>div>div>div>div>form>div>button'
            );
            await page.waitForNavigation({
                waitUntil: ["load"],
            });
        } else {
            log(chalk.yellow(`[TIDAK ADA SESI LOGIN] ${nama}`));
            await page.type("#email", username);
            await page.type("#pass", username);

            await page.click(
                'button[name="login"][type="submit"]'
            );
            // await page.waitForNavigation({
            //     waitUntil: ["load"],
            // });
        }
    }

    await page.waitForTimeout(5000);
    if ((await page.$('input[id="email"]')) !== null) { //jika belum login
        log(chalk.red(`[GAGAL LOGIN] ${nama}`));
        send(`🔴FAILED LOGIN : ${nama}`)
        return false; //gagal login
    }else{
        log(chalk.green(`[LOGIN] ${nama}`));
        return true;//berhasil login
    }

};

const isCp = async function(page, data) {
    const nama = data['Nama Akun'] 

    if (page.url().includes("checkpoint")) {
        //check apakah tombol tutup atau permanen
        const btnTutup = await page.$$(`div[role="main"] div[aria-label="Tutup"]`);
        if(btnTutup.length > 0){
            try {
                await btnTutup[0].click();
                await page.waitForTimeout(5000);
            } catch (e) {}
            console.log("click btn tutup")
            return false
        }

        log(chalk.red(`[CHECKPOINT] ${nama}`));
        send(`🔴CP : ${nama}`)
        return true
    } else {
        log(chalk.green(`[NO CP] ${nama}`));
        return false
    }
};


const isMp = async function(page, data) {
    const nama = data['Nama Akun'] 

    await page.goto("https://www.facebook.com/marketplace/create", {
        waitUntil: ["load"],
        timeout: 50000,
    });

    await page.waitForTimeout(5000);

    if ((await page.$x(`//div[text()='Anda Tidak Bisa Jual Beli di Facebook']`)).length > 0 || (await page.$x(`//span[text()='Minta Tinjauan']`)).length > 0 || (await page.$x(`//span[contains(text(), 'Kami Sedang Meninjau Permintaan Anda')]`)).length > 0) {

        const tinjauButton = await page.$x(`//span[text()='Minta Tinjauan']`);
        if (tinjauButton.length > 0) {
            try {
                await tinjauButton[0].click();

                await page.waitForTimeout(7000);
            } catch (e) {}
        }

        log(chalk.red(`[NO MP] ${nama}`));
        send(`🟣Tinjauan MP : ${nama}`)
        return false
    } else {
        log(chalk.green(`[MP LOLOS] ${nama}`));
        return true;
    }
};

const isLimit = async function(page, data) {
    const nama = data['Nama Akun'] 

    await page.goto("https://mtouch.facebook.com/marketplace/selling/item", {
        waitUntil: ["load"],
        timeout: 50000,
    });

    await page.waitForTimeout(5000);

    if ((await page.$('div[aria-label="Tambahkan foto"]')) !== null) {
        log(chalk.green(`[LEPAS LIMIT] ${nama}`));
        return false;
    }else{
        log(chalk.red(`[LIMIT] ${nama}`));
        send(`🟣Tinjauan MP : ${nama}`)
        return true
    }
};

module.exports = {
    tutupObrolan,
    isLogin,
    isCp,
    isMp,
    isLimit,
    cookiesMaster,
    cookiesPath,
    listAccount,
    updateListAccount
};