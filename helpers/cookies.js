const csv = require("csv-parser");

const parseCookieData = function(cookieData) {
    const cookieArray = cookieData.split("\n");
    const jsonResult = [];

    cookieArray.forEach((cookie) => {
        if (cookie.trim() !== "") {
            const [name, value, domain, path] = cookie.split(",");
            const cookieObject = {
                name: name,
                value: value,
                domain: domain,
                path: path.replace("\r", ""),
            };
            jsonResult.push(cookieObject);
        }
    });

    return jsonResult;
};


const transformCookies = function(cookies) {
    const transformedCookies = cookies.map((cookie) => {
        const { name, value, domain, path } = cookie;
        return `${name},${value},${domain},${path}`;
    });

    return transformedCookies.join("\n");
};

module.exports = {
    parseCookieData,
    transformCookies
};