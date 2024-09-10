const fs = require("fs");
const csv = require("csv-parser");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { parseCookieData } = require("./helpers/cookies")
// const { csvToJson } = require("./helpers/global")


const folderPath = "Cookies"; // Gantilah dengan path folder yang sesuai


// Baca isi direktori
// let file_cookies = [];
(async () => {
  return
    const fileName = fs.readdirSync(folderPath);
    const fileNames = fileName.filter((filenam) => filenam.endsWith(".csv"));
    let data = [];

    for (let i = 0; i < fileNames.length; i++) {
        const dt = fileNames[i].replace('.csv', '').split('#');
        const nama_akun =dt[0].toLowerCase().replaceAll("_"," ");
        const newFolder = `${folderPath}/new/${nama_akun}`;

        data.push({
            "Pilih" : "",
            "No": i+1,
            "Nama Project" : "sh",
            "Nama Akun" : nama_akun,
            "UID/Email/No HP" : dt[2],
            "Pasword" : dt[3],
            "Kode 2FA" : "",
            "Status" : "",
            "Bahasa" : "",
            "Akses Marketplace" : "",
            "Limit MP" : "",
            "Cookies" : "",
            "Cookies Lama" : "",
            "UID" : dt[1]
        })

        await fs.mkdir(newFolder, { recursive: true }, (err) => {
          if (err) {
            console.error(`Gagal membuat folder: ${err}`);
          }
          console.log(`Folder berhasil dibuat di: ${folderPath}`);
        });


        const jsonCookies = JSON.stringify(csvToJson(`${folderPath}/${fileNames[i]}`), null, 2);
        console.log(jsonCookies)
        // return

        // Tulis objek ke file JSON
        await fs.writeFile(`${newFolder}/${nama_akun}.json`, jsonCookies, (err) => {
          if (err) {
            console.error(`Gagal menyimpan file JSON: ${err}`);
          }
          console.log('File JSON berhasil disimpan');
        });
        // break
    }

    // console.log(data);
    // return

    const csvWriter = createCsvWriter({
        path: `${folderPath}/new/master.csv`,
        header: [
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
            { id: 'UID', title:  'UID' },
        ]
    });

    await csvWriter.writeRecords(data)
        .then(() => console.log('CSV file written successfully'))
        .catch((err) => console.error(err));


// console.log(fileNames);

})().catch((err) => console.error(err));

function csvToJson(filePath) {
  const csvContent = fs.readFileSync(filePath, 'utf-8'); // Membaca konten CSV dari file
  const rows = csvContent.split('\n'); // Memisahkan setiap baris CSV

  const cookies = rows.map(row => {
    const [name, value, domain, path] = row.split(',');
    return {
      domain: domain || '.facebook.com',
      expirationDate: null, // Dapat ditentukan lebih lanjut jika diperlukan
      hostOnly: false,
      httpOnly: true, // Atur sesuai kebutuhan
      name: name.trim(),
      path: path ? path.trim() : '/',
      sameSite: 'no_restriction', // Atur sesuai kebutuhan
      secure: true,
      session: true, // Bisa diatur berdasarkan kondisi tertentu
      storeId: null,
      value: value.trim()
    };
  });

  return cookies;
}