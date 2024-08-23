const { send } = require("../helpers/telegram");
const fs = require("fs");

async function tutupObrolan(page) {

    const tutupObrolanBtn = await page.$$(`div[aria-label="Tutup obrolan"]`);
    for (const button of tutupObrolanBtn) {
        try {
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

async function belumLogin(page) {
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
        //berhasil login
    }
};

const checkpoint = async function(page, dt, folderPath, folderCp, fileNames) {

    if (page.url().includes("checkpoint")) {
        console.log("checkpoint");
        send(`🔴CP : ${dt[0]}`)
        await page.deleteCookie();
        await page.close();
        await fs.rename(
            `${folderPath}/${fileNames}`,
            `${folderCp}/${fileNames}`,
            (err) => {
                if (err) {
                    console.error("Error moving file:", err);
                } else {
                    console.log("File moved successfully!");
                }
            }
        );
        return true
    } else {
        return false
    }
};


const tinjauan = async function(page, dt, folderPath, folderTinjauan, fileNames) {
    if ((await page.$x(`//span[text()='Minta Tinjauan']`)).length > 0 || (await page.$x(`//span[text()='Kami Sedang Meninjau Permintaan Anda']`)).length > 0) {
        console.log("tinjauan MP");
        send(`🟣Tinjauan MP : ${dt[0]}`)
        await page.deleteCookie();
        await page.close();
        await fs.rename(
            `${folderPath}/${fileNames}`,
            `${folderTinjauan}/${fileNames}`,
            (err) => {
                if (err) {
                    console.error("Error moving file:", err);
                } else {
                    console.log("File moved successfully!");
                }
            }
        );
        return true;
    } else {
        return false;
    }
};

module.exports = {
    tutupObrolan,
    belumLogin,
    checkpoint,
    tinjauan
};