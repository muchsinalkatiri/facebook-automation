// const { phoneNumberFormatter } = require("./helpers/global");
const { csvToJson } = require("./helpers/global");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const util = require("util");
const delay = util.promisify(setTimeout);

const { Client, LocalAuth } = require("whatsapp-web.js");
var qrcode = require("qrcode-terminal");

let ready = false;
const client = new Client({
  puppeteer: { headless: true },
  authStrategy: new LocalAuth(),
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-extensions",
    "--disable-gpu",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--disable-dev-shm-usage",
    "--single-process",
  ],
});

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true }, function (qrcode) {
    console.log(qrcode);
  });
});

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("authenticated", (session) => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  console.error("AUTHENTICATION FAILURE", msg);
  ready = false;
});

client.on("message", (msg) => {
  if (msg.body == "!ping") {
    msg.reply("pong");
  }
});

const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
};
client.on("ready", async () => {
  console.log("Client is ready!");
  const path = "dagingKambing.csv";
  const dagingCsv = await csvToJson(path);

  for (const obj of dagingCsv) {
    let is_wa = null;
    try {
      if (obj.nomer != null && obj.nomer.startsWith("08")) {
        const isRegisteredNumber = await checkRegisteredNumber(
          phoneNumberFormatter(obj.nomer)
        );
        if (isRegisteredNumber) {
          is_wa = "ada";
          console.log("ada wa");
        } else {
          is_wa = "tidak";
          console.log("gaada wa");
        }

        await delay(5000);
      }
    } catch (e) {
      console.log(e.message);
      continue;
    }
    obj.is_wa = is_wa;
  }

  console.log(dagingCsv);
  const csvWriter = createCsvWriter({
    path: path,
    header: [
      { id: "name", title: "name" },
      { id: "nomer", title: "nomer" },
      { id: "address", title: "address" },
      { id: "kota", title: "kota" },
      { id: "keyword", title: "keyword" },
      { id: "is_wa", title: "is_wa" },
    ],
    append: false, // Set to true if you want to append to an existing file
  });

  // Write the updated 'masterLink' array to the CSV file
  csvWriter
    .writeRecords(dagingCsv)
    .then(() => {
      console.log("CSV file has been updated successfully.");
    })
    .catch((error) => {
      console.error("Error writing CSV file:", error);
    });
});

function phoneNumberFormatter(number) {
  formatted = number.replace(/\D/g, "");

  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.substr(1);
  }

  if (!formatted.endsWith("@c.us")) {
    formatted += "@c.us";
  }

  return formatted;
}
