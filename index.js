const { rawat } = require("./rawat");
// const { rawatTinjauan } = require("./rawatTinjauan");
const { check } = require("./check");
// const { check_banding } = require("./check_banding");
// const { check_tinjauan } = require("./check_tinjauan");
// const { check_lepas_limit } = require("./check_lepas_limit");
// const { obati_duplikat } = require("./obati_duplikat");
// const { hapusTawaranPerluPerhatian } = require("./hapusTawaranPerluPerhatian");
// const { tawarkan_ulang } = require("./tawarkan_ulang");
// const { updateLinkMp } = require("./updateLinkMp");
const { check_kondisi } = require("./check_kondisi");




const cron = require("node-cron");
cron.schedule("23 5,12,15 * * *", function() {
    check('aktif', 'all', 'noloop');
});


cron.schedule("0 0 * * 6", function() {
    rawat('all', 'lepas limit'); // mp semua 
});

cron.schedule("10 0 * * *", function() {
    rawat('aktif', 'limit'); //mp aktif dan lepas limit
    check_kondisi();
});

// cron.schedule("0 1 * * 0-5", function() {
//     check_banding();
//     check_tinjauan();
// });

// cron.schedule("0 2 * * 0-5", function() {
//     check_lepas_limit();
//     check_lepas_limit('rawat');
// });


// cron.schedule("0 4 * * 0-5", function() {
//     hapusTawaranPerluPerhatian()
// });
// cron.schedule("0 5 * * 0-5", function() {
//     check("C:/Users/Administrator/Documents/fbmp/Cookies/rawat", "noloop");
// });

// cron.schedule("0 23 * * 6", function() {
//     tawarkan_ulang()
//     updateLinkMp()
// });