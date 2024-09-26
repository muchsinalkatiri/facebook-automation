// const { check_v2 } = require("./check_v2");
const { check } = require("./check");
// const { check_banding } = require("./check_banding");
// const { check_tinjauan } = require("./check_tinjauan");
// const { check_kondisi } = require("./check_kondisi");
// const { rawat } = require("./rawat");
// const { obati_duplikat } = require("./obati_duplikat");
const { hapusTawaranPerluPerhatian } = require("./hapusTawaranPerluPerhatian");
// const { tawarkan_ulang } = require("./tawarkan_ulang");
// const { rawatTinjauan } = require("./rawatTinjauan");

const { send } = require("./helpers/telegram");


(async () => {
    // hapusTawaranPerluPerhatian();
    // check('aktif', 'all', 'noloop');
    // check("C:/Users/Administrator/Documents/fbmp/Cookies", "noloop");
    // rawatTinjauan();
    // obati_duplikat()
    // tawarkan_ulang()
    // rawat();
    // check_kondisi();
    // const sendTelegram = await send("test");
    // const reply_id = sendTelegram.result.message_id;

    //   console.log(reply_id);
    // await send("ini reply", reply_id);


})().catch((err) => console.error(err));