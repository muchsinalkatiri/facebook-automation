const fs = require("fs");
const csv = require("csv-parser");

const csvToJson = async function(source) {

    // Create an array to store CSV data
    const linkArray = [];

    // Read the CSV file and parse its content
    await new Promise((resolve, reject) => {
        fs.createReadStream(source)
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

    return linkArray
};

module.exports = {
    csvToJson
};