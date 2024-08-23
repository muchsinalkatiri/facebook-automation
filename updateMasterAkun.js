const fs = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai
updateMasterAkun();

function updateMasterAkun(folder) {
    (async () => {
        const folderPath = "C:/Users/Administrator/Documents/fbmp/Cookies"; // Gantilah dengan path folder yang sesuai
        const fileNames = fs.readdirSync(folderPath)
            .filter((filename) => filename.endsWith(".csv"));
        const names = fileNames.map((filename) => filename.replace('.csv', ''))
            .join("\n"); // Convert array to newline-separated string
        await fs.writeFileSync(`${folderPath}/master/master.csv`, names);


        const folderPathRawat = "C:/Users/Administrator/Documents/fbmp/Cookies/rawat"; // Gantilah dengan path folder yang sesuai
        const fileNamesRawat = fs.readdirSync(folderPathRawat)
            .filter((filename) => filename.endsWith(".csv"));
        const namesRawat = fileNamesRawat.map((filename) => filename.replace('.csv', ''))
            .join("\n"); // Convert array to newline-separated string
        await fs.writeFileSync(`${folderPath}/master/masterRawat.csv`, names);


        const folderPathTinjauan = "C:/Users/Administrator/Documents/fbmp/tinjauan/Cookies"; // Gantilah dengan path folder yang sesuai
        const fileNamesTinjauan = fs.readdirSync(folderPathTinjauan)
            .filter((filename) => filename.endsWith(".csv"));
        const namesTinjauan = fileNamesTinjauan.map((filename) => filename.replace('.csv', ''))
            .join("\n"); // Convert array to newline-separated string
        await fs.writeFileSync(`${folderPath}/master/masterTinjauan.csv`, names);

        //buat csv link profile 
        let link;
        let linkArray = [];
        for (let i = 0; i < fileNames.length; i++) {
            const dt = fileNames[i].replace('.csv', '').split('#');

            if (dt[1] != 'error') {
                link = `https://facebook.com/profile.php?id=${dt[1]}`
                linkArray.push({ "link": link, "status": "normal" }); // Add the link to the linkArray
            }
        }

        for (let i = 0; i < fileNamesRawat.length; i++) {
            const dt = fileNamesRawat[i].replace('.csv', '').split('#');

            if (dt[1] != 'error') {
                link = `https://facebook.com/profile.php?id=${dt[1]}`
                linkArray.push({ "link": link, "status": "rawat" }); // Add the link to the linkArray
            }
        }

        for (let i = 0; i < fileNamesTinjauan.length; i++) {
            const dt = fileNamesTinjauan[i].replace('.csv', '').split('#');

            if (dt[1] != 'error') {
                link = `https://facebook.com/profile.php?id=${dt[1]}`
                linkArray.push({ "link": link, "status": "Tinjau" }); // Add the link to the linkArray
            }
        }

        const csvWriter = createCsvWriter({
            path: `${folderPath}/master/masterLinkProfile.csv`,
            header: [
                { id: 'link', title: 'Link' },
                { id: 'status', title: 'Status' }
            ]
        });

        csvWriter.writeRecords(linkArray)
            .then(() => console.log('CSV file written successfully'))
            .catch((err) => console.error(err));

        console.log({ "Siap Tempur": fileNames.length, "Akun Rawat": fileNamesRawat.length, "Akun Tinjau": fileNamesTinjauan.length })

    })().catch((err) => console.error(err));
}

module.exports = {
    updateMasterAkun,
};