const fs = require('fs');
const csv = require('csv-parser');

async function tambahTemanBylink(page) {
    const folderPath = 'C:/Users/Administrator/Documents/fbmp/Cookies/master/masterLinkProfile.csv';

    // Create an array to store CSV data
    const linkArray = [];

    // Read the CSV file and parse its content
    await new Promise((resolve, reject) => {
        fs.createReadStream(folderPath)
            .pipe(csv())
            .on('data', (row) => {
                // Push each row (CSV entry) into the linkArray
                linkArray.push(row);
            })
            .on('end', () => {
                // Now, linkArray contains the parsed CSV data
                resolve();
            })
            .on('error', (error) => {
                // Handle any errors during the CSV processing
                reject(error);
            });
    });

    do {
        let randomIndex = Math.floor(Math.random() * linkArray.length);
        let link = linkArray[randomIndex]["Link"];

        await page.goto(link, {
            waitUntil: ["load"],
            timeout: 50000,
        });
        await page.waitForTimeout(2000);

        const btnTambahTeman = await page.$x(`//span[text()='Tambahkan teman']`);
        try {
            await btnTambahTeman[0].click();
            await page.waitForTimeout(5000);
            break;
        } catch (e) {
            continue
        }
    } while (true);

}

module.exports = tambahTemanBylink;