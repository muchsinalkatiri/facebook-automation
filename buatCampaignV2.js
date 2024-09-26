const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');
const csv = require('csv-parser');
const path = require('path'); // Import path module
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { listAccount} = require("./helpers/facebook")

const xml2js = require('xml2js');
const parser = new xml2js.Parser();


// Logging functions
const logRed = (message) => console.log(chalk.red(message));
const logGreen = (message) => console.log(chalk.green(message));

(async () => {
    const folderMaster = `C:/ROBOT FB UNDERGROUND 2024/Data`;

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const projek = await new Promise((resolve) => {
        rl.question('1. Masukan nama Projek: ', (input) => {
            if (!input) {
                logRed('nama projek harus dimasukan');
                rl.close();
                return;
            }

            if (!fs.existsSync(`${folderMaster}/Cookies/${input}`)) {
                logRed('folder projek tidak ditemukan');
                rl.close();
                return;
            }

            resolve(input);
        });
    });

    const master = await new Promise((resolve) => {
        rl.question('2. Masukan nama Master bahan posting: ', (input) => {
            if (!input) {
                logRed('nama Master harus dimasukan');
                rl.close();
                return;
            }

            const masterFolder = `${folderMaster}/Bahan Posting/${input}`;

            if (!fs.existsSync(masterFolder)) {
                logRed('folder master tidak ditemukan');
                rl.close();
                return;
            }

            const masterCSV = `${masterFolder}/master.csv`;

            if (!fs.existsSync(masterCSV)) {
                logRed('file csv master tidak ditemukan');
                rl.close();
                return;
            }

            const csvData = [];

           fs.createReadStream(masterCSV)
                .pipe(csv())
                .on('data', (row) => {
                    csvData.push(row);
                })
                .on('end', async () => {
                    // Convert CSV to XML
                    const xmlData = csvToXml(csvData);

                    // Define the output XML file path
                    const xmlFilePath = path.join(`${folderMaster}/Bahan Posting`, `master.xml`);

                    // Write XML data to a file using Promises
                    try {
                        await writeFileAsync(xmlFilePath, xmlData);
                        resolve(input);
                    } catch (err) {
                        logRed('Error writing XML file: ' + err.message);
                    }
                });

        });
    });

    const xmlFile = await fs.readFileSync(`${folderMaster}/Bahan Posting/master.xml`, 'utf8');

   const masterJsons = await parseXmlToJson(xmlFile);
   const masterJson = masterJsons['Data']['Baris'];


    const limit = await new Promise((resolve) => {
        rl.question(
            "3. Lepas limit atau limit (default a):\n" +
            "   a. lepas limit\n" +
            "   b. limit\n" +
            "Pilihan : ",
            (input) => {
                if (!input) {
                    input = "a"
                }
                if (!["a", "b"].includes(input)) {
                    logRed("pilihan tidak ada")
                    rl.close();
                    return
                }else if(input == 'a'){
                    input = 'lepas limit';
                }else if(input == 'b'){
                    input = 'limit';
                }
                resolve(input);
            }
        );
    });

    const modePosting = await new Promise((resolve) => {
        rl.question(
            "4. Mode posting (default a):\n" +
            "   a. standart post\n" +
            "   b. barbar mobile\n" +
            "   c. selang seling\n" +
            "   d. acak\n" +
            "Pilihan : ",
            (input) => {
                if (!input) {
                    input = "a"
                }
                if (!["a", "b", "c", "d"].includes(input)) {
                    logRed("pilihan tidak ada")
                    rl.close();
                    return
                }
                resolve(input);
            }
        );
    });

    const mulaiSelesai = await new Promise((resolve) => {
        rl.question(
            "5. Kolom mulai & awal (default a):\n" +
            "   a. sama semua\n" +
            "   b. satu satu urut\n" +
            "   c. dibagi + diulangi\n" +
            "   d. satu satu random\n" +
            "   e. dibagi random\n" +
            "Pilihan : ",
            (input) => {
                if (!input) {
                    input = "a"
                }
                if (!["a", "b", "c", "d", "e"].includes(input)) {
                    logRed("pilihan tidak ada")
                    rl.close();
                    return
                }
                resolve(input);
            }
        );
    });


    let dibagiPer
    if (mulaiSelesai == "c" || mulaiSelesai == "e") {
        dibagiPer = await new Promise((resolve) => {
            rl.question("6. mulai dan selesai kolomnya di bagi per berapa?: ", (input) => {
                if (!input) {
                    logRed("harus di isi")
                    rl.close();
                    return
                }
                resolve(Number(input));
            });
        });
    }

    //-------------------------------------------------------------


    let list_account;
    if(limit == 'lepas limit'){
        list_account = await listAccount('all', 'aktif', 'aktif', 'lepas limit');
    }else if(limit == 'limit'){
        list_account = await listAccount('all', 'aktif', 'aktif', 'limit');
    }

    let data = []

    for (let i = 0; i < list_account.length; i++) {
        let mode;
        if(modePosting == 'a'){
            mode = 'Produk Umum - Mode Web - Standar Post';
        }else if(modePosting == 'b'){
            mode = "Barbar Mobile";
        }else if(modePosting == 'c'){
            if (i % 2 === 0) {
                mode = 'Produk Umum - Mode Web - Standar Post';
            }else{
                mode = "Barbar Mobile";
            }
        }else if (modePosting == 'd') {
            // Randomly choose between two modes
            mode = Math.random() < 0.5
                ? 'Produk Umum - Mode Web - Standar Post'
                : 'Barbar Mobile';
        }

         let mulai, selesai;
        const mulaiSelesaiArray = [];
        for (let j = 1; j <= masterJson.length; j += dibagiPer) {
            let mulaiSegmen = j;
            let selesaiSegmen = j + dibagiPer - 1;

            if (selesaiSegmen > masterJson.length) {
                selesaiSegmen = masterJson.length;
            }

            mulaiSelesaiArray.push({ mulai: mulaiSegmen, selesai: selesaiSegmen });
        }

        if (mulaiSelesai == "a") {
            mulai = 1;
            selesai = masterJson.length;
        } else if (mulaiSelesai == "b") {
            let index = i % masterJson.length + 1;
            mulai = index;
            selesai = index;
        } else if (mulaiSelesai == "c") {
            let segmentIndex = i % mulaiSelesaiArray.length;
            mulai = mulaiSelesaiArray[segmentIndex].mulai;
            selesai = mulaiSelesaiArray[segmentIndex].selesai;
        } else if (mulaiSelesai == "d") {
            let randomIndex = Math.floor(Math.random() * masterJson.length) + 1;
            mulai = randomIndex;
            selesai = randomIndex;
        }else if (mulaiSelesai === "e") {
            let randomSegmentIndex = Math.floor(Math.random() * mulaiSelesaiArray.length);
            mulai = mulaiSelesaiArray[randomSegmentIndex].mulai;
            selesai = mulaiSelesaiArray[randomSegmentIndex].selesai;
        }

        data.push({
            centang: "TRUE",
            mode : mode,
            projek : projek,
            akun: list_account[i]['Nama Akun'],
            bahanPosting: 'master',
            mulai: mulai,
            selesai: selesai,
        });
    }
    console.log(data.length)

    const filePath = path.join(`${folderMaster}/Bahan Posting/${master}`, 'posting.csv');
    const csvContent = data.map(row => 
        `${row.centang},${row.mode},${row.projek},${row.akun},${row.bahanPosting},${row.mulai},${row.selesai}`
    ).join('\n');

    // Simpan data ke posting.csv tanpa header
    fs.writeFile(filePath, csvContent, (err) => {
        if (err) {
            logRed('Error menulis CSV: ' + err.message);
        } else {
            logGreen('Data berhasil disimpan ke posting.csv tanpa header!');
        }
    });



})().catch((err) => console.error(err));

// Correctly defined function to convert CSV data to XML
function csvToXml(data) {
    let xml = '<?xml version="1.0" encoding="utf-8"?>\n<Data>\n';

    data.forEach((row) => {
        xml += '  <Baris>\n';
        for (const [key, value] of Object.entries(row)) {
            // Replace spaces with underscores and normalize keys as needed
            const sanitizedKey = key.replace(/\s+/g, '_');
            xml += value
                ? `    <${sanitizedKey}>${value}</${sanitizedKey}>\n`
                : `    <${sanitizedKey} />\n`; // Self-closing tag for empty values
        }
        xml += '  </Baris>\n';
    });

    xml += '</Data>\n';
    return xml;
}

// Utility function to write file asynchronously
function writeFileAsync(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function parseXmlToJson(xmlData) {
    return new Promise((resolve, reject) => {
        parser.parseString(xmlData, (err, result) => {
            if (err) {
                return reject(err); // Jika ada error, reject promise
            }
            resolve(result); // Jika sukses, resolve dengan hasil JSON
        });
    });
}