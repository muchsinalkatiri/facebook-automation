const fs = require("fs");
const csv = require("csv-parser");


// let akun = [];
const csvFilePath = "data_akun8.csv"; // Sesuaikan dengan path file CSV Anda


const csvContent = fs.readFileSync(csvFilePath, "utf-8");
const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);


// Skip the first line (header)
const akun = lines.slice(1).map((line) => line.split(","));

akun.forEach((akunItem) => {
    const folderPath = `hasil_cookies`;
    //   // Buat nama file baru dari kolom EMAIL
    const newCsvFilePath = `${folderPath}/0_${akunItem[0]}.csv`;
    //   // Tulis data ke file CSV baru
    fs.appendFileSync(
        newCsvFilePath,
        `${convertToFormattedCookies(akunItem[1])}`
    );
});

function convertToFormattedCookies(input) {
    const cookies = input.split(";");

    const formattedCookies = cookies.map((cookie) => {
        const [name, value] = cookie.trim().split("=");
        return `${name},${value},.facebook.com,/`;
    });

    return formattedCookies.join("\n");
}