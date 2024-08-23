const readline = require('readline');
const fs = require('fs');
const chalk = require("chalk");
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const updateMasterAkun = require("./updateMasterAkun");

const logRed = (message) => console.log(chalk.red(message));
const logGreen = (message) => console.log(chalk.green(message));
const log = console.log

const folderMaster = "C:/Users/Administrator/Documents/fbmp/Campaign"; // Gantilah dengan path folder yang sesuai
const folderCampaign = `${folderMaster}/posting`;
const fileMasterCookie = "C:/Users/Administrator/Documents/fbmp/Cookies/master/master.csv";

(async () => {

    const cookie = await new Promise((resolve, reject) => {
        const data = [];
        fs.createReadStream(fileMasterCookie)
            .pipe(csv({ headers: false }))
            .on('data', (row) => {
                data.push(row[0]);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (error) => {
                reject(error);
            });
    });


    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });


    const master = await new Promise((resolve) => {
        rl.question("1. Masukan nama CSV Master: ", (input) => {

            if (!input) {
                logRed("nama Master harus dimasukan")
                rl.close();
                return
            }

            if (!fs.existsSync(`${folderMaster}/${input}.csv`)) {
                logRed("file master tidak ditemukan")
                rl.close();
                return
            }
            resolve(input);
        });
    });

    const masterCsv = await new Promise((resolve, reject) => {
        const data = []
        fs.createReadStream(`${folderMaster}/${master}.csv`)
            .pipe(csv())
            .on('data', (row) => {
                data.push(row);
            })
            .on('end', () => {
                resolve(data);
            })
            .on('error', (error) => {
                reject(error);
            });
    });

    const namaFolder = await new Promise((resolve) => {
        rl.question("2. Masukan nama folder (jika tidak dimasukan sama dengan nama master): ", (input) => {
            let folder = `${folderCampaign}/${input || master}`;
            if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
            }
            resolve(folder);
        });
    });

    const berapaFile = await new Promise((resolve) => {
        rl.question("3. Dibagi berapa file? (default 1): ", (input) => {
            if (!input) {
                input = 1
            }
            if ((cookie.length / input) < 1) {
                logRed("jumlah csv terlalu sedikit")
                rl.close();
                return
            }

            resolve(input);
        });
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
                resolve(input);
            });
        });
    }


    //==============================================================================
    const data = []
    if (mulaiSelesai == "a") {
        for (let i = 0; i < cookie.length; i++) {
            data.push({
                nomor: i + 1,
                akun: cookie[i],
                bahanPosting: master,
                mulai: 1,
                selesai: masterCsv.length,
                centang: true
            });
        }
    } else if (mulaiSelesai == "b" || mulaiSelesai == "d") {
        const mS = [];
        for (let i = 1; i <= masterCsv.length; i++) {
            mS.push(i);
        }
        let j = 0;
        for (let i = 0; i < cookie.length; i++) {
            if (j == masterCsv.length) {
                j = 0
            }
            if (mulaiSelesai == "d") {
                j = Math.floor(Math.random() * mS.length)
            }
            data.push({
                nomor: i + 1,
                akun: cookie[i],
                bahanPosting: master,
                mulai: mS[j],
                selesai: mS[j],
                centang: true
            });
            j++
        }
    } else if (mulaiSelesai == "c" || mulaiSelesai == "e") {
        const mulaiSelesaiArray = [];
        for (let i = 1; i <= masterCsv.length; i += parseInt(dibagiPer)) {
            let mulai = i;
            let selesai = i + (parseInt(dibagiPer) - 1);

            if (selesai > masterCsv.length) {
                selesai = masterCsv.length
            }
            mulaiSelesaiArray.push({ mulai, selesai });
        }

        let j = 0;
        for (let i = 0; i < cookie.length; i++) {
            if (j == mulaiSelesaiArray.length) {
                j = 0
            }
            if (mulaiSelesai == "e") {
                j = Math.floor(Math.random() * mulaiSelesaiArray.length)
            }
            data.push({
                nomor: i + 1,
                akun: cookie[i],
                bahanPosting: master,
                mulai: mulaiSelesaiArray[j]['mulai'],
                selesai: mulaiSelesaiArray[j]['selesai'],
                centang: true
            });
            j++
        }
    }

    const ukuranPotongan = Math.ceil(data.length / berapaFile);

    for (let i = 0; i < berapaFile; i++) {
        const awalIndex = i * ukuranPotongan;
        const akhirIndex = awalIndex + ukuranPotongan;
        const potonganData = data.slice(awalIndex, akhirIndex);

        const tujuan = `${namaFolder}/${i+1}.csv`
        const csvWriter = createCsvWriter({
            path: tujuan,
            header: [
                { id: 'nomor', title: 'Nomor' },
                { id: 'akun', title: 'Akun' },
                { id: 'bahanPosting', title: 'Bahan Posting' },
                { id: 'mulai', title: 'Mulai' },
                { id: 'selesai', title: 'Selesai' },
                { id: 'centang', title: 'Centang' },

            ]
        });


        csvWriter.writeRecords(potonganData)
            .then(() => console.log('File CSV berhasil dibuat'))
            .catch(err => console.error('Gagal membuat file CSV', err));
    }

    logGreen('yoman')

    rl.close();

})().catch((err) => console.error(err));