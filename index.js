const { rawat } = require("./rawat");
const { rawatTinjauan } = require("./rawatTinjauan");
const { check } = require("./check");
const { check_banding } = require("./check_banding");
const { check_tinjauan } = require("./check_tinjauan");
const { check_lepas_limit } = require("./check_lepas_limit");
const { obati_duplikat } = require("./obati_duplikat");
const { hapusTawaranPerluPerhatian } = require("./hapusTawaranPerluPerhatian");
const { tawarkan_ulang } = require("./tawarkan_ulang");
const { updateLinkMp } = require("./updateLinkMp");



const cron = require("node-cron");
check();
cron.schedule("0 5,9,12,15,18 * * *", function() {
    check();
});


cron.schedule("1 22 * * 0-5", function() {
    rawat();
});

cron.schedule("10 0 * * 0-5", function() {
    rawatTinjauan();
    obati_duplikat();
});

cron.schedule("0 1 * * 0-5", function() {
    check_banding();
    check_tinjauan();
});

cron.schedule("0 2 * * 0-5", function() {
    check_lepas_limit();
    check_lepas_limit('rawat');
});

cron.schedule("3 2,13 * * 0-5", function() {
    rawat("C:/Users/Administrator/Documents/fbmp/Cookies/rawat");
});

cron.schedule("0 4 * * 0-5", function() {
    hapusTawaranPerluPerhatian()
});
cron.schedule("0 5 * * 0-5", function() {
    check("C:/Users/Administrator/Documents/fbmp/Cookies/rawat", "noloop");
});

cron.schedule("0 23 * * 6", function() {
    tawarkan_ulang()
    updateLinkMp()
});