const { csvToJson } = require("../helpers/global");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { tutupObrolan } = require("../helpers/facebook")


async function mpByLink(page, userId) {
    try {
        const masterLinkPath = 'C:/Users/Administrator/Documents/fbmp/Cookies/master/masterLinkMp.csv'
        const masterLink = await csvToJson(masterLinkPath);
        masterLink.sort((a, b) => {
            return a.klik_kita - b.klik_kita;
        });

        const filteredMasterLink = masterLink.filter(item => item.userId !== userId);
        if (filteredMasterLink.length == 0) {
            return
        }

        const id = filteredMasterLink[0]['id']
        console.log(id)

        await page.goto(`https://www.facebook.com/marketplace/item/${id}/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks`, {
            waitUntil: ["load"],
            timeout: 50000,
        });



        const butonKirimPesan = await page.$$(`div[aria-label="Kirim"][role="button"]`);
        for (const button of butonKirimPesan) {
            try {
                await button.click();
                await page.waitForTimeout(1000);

            } catch (e) {}
        }

        await page.waitForTimeout(5000);

        await tutupObrolan(page);


        const existingEntryIndex = masterLink.findIndex(masterEntry => masterEntry.id === id);
        masterLink[existingEntryIndex]['klik_kita'] = parseInt(masterLink[existingEntryIndex]['klik_kita']) + 1


        masterLink.sort((a, b) => {
            return b.klik_tawaran - a.klik_tawaran;
        });

        // Create a CSV writer
        const csvWriter = createCsvWriter({
            path: masterLinkPath,
            header: [
                { id: 'id', title: 'id' },
                { id: 'judul', title: 'judul' },
                { id: 'klik_tawaran', title: 'klik_tawaran' },
                { id: 'klik_kita', title: 'klik_kita' },
                { id: 'userId', title: 'userId' },
            ],
            append: false, // Set to true if you want to append to an existing file
        });

        // Write the updated 'masterLink' array to the CSV file
        csvWriter.writeRecords(masterLink)
            .then(() => {
                console.log('CSV file has been updated successfully.');
            })
            .catch((error) => {
                console.error('Error writing CSV file:', error);
            });


    } catch (e) {
        console.log(e.message)
    }
}
// Export fungsi agar bisa diakses dari file lain
module.exports = mpByLink;