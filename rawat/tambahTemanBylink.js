const fs = require('fs');
const csv = require('csv-parser');
const { listAccount } = require("../helpers/facebook")

async function tambahTemanBylink(page) {
    // Create an array to store CSV data
    const linkArray = [];

    const list_account = await listAccount('all', 'aktif', 'all', 'all');


    let loop = 1;
    do {
        let randomIndex = Math.floor(Math.random() * list_account.length);
        let name = list_account[randomIndex]["Nama Akun"];
        
        try {
            const search = await page.$$('input[aria-label="Cari di Facebook"]');
            await search[0].click();
            await search[0].type(name);
            await page.keyboard.press('Enter');

            await page.waitForTimeout(2000);

            await page.click('a[href^="/search/people/"][role="link"]');
            await page.waitForTimeout(1000);

            const link = await page.$$(`div[role="article"] span div a[role="presentation"]`);
            await link[0].click();
            await page.waitForTimeout(3000);

            const tambah = await page.$$(`div[aria-label="Tambahkan teman"]`);

            if(tambah.length > 0 ){
                await tambah[0].click();
                break;
            }else{
                continue;
            }

            if(loop == 3){
                break;
            }
            
            await page.waitForTimeout(3000);
        } catch (e) {}

    } while (true);

}

module.exports = tambahTemanBylink;