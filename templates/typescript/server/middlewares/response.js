const logCat = require("../../library/logger")("app");
const config = require('../../config/app');
module.exports = function (req, res, next) {
    req.offset = req.query.offset ? req.query.offset : 0;
    const lang = (req.get('mbq_lang') || req.headers['mbq_lang'] || 'en').toString();
    res.sendJSON = (data, msg = null, status = 200) => {
        let resObj = { status: true, message: msg ? msg : "", error: null };
        if (typeof data == "object") {
            resObj.data = data;
        } else {
            resObj.data = { app_code: data };
        }
        res.status(status).json(resObj);
    }

    res.sendError = (error_obj, msg = null, status = 200) => {
        logCat(error_obj)

        // Handle the error message of knex.js ORM for production only. 
        // Prevent to expose stack-trace of database entity breaking
        const isProdEnv = config.ENVIRONMENT === "production";
        const isKnexError = error_obj && error_obj.routine && error_obj.detail;
        const errorMessage = msg ? msg : ""
        if (isProdEnv) {
            console.error(error_obj);
        }
        if (isProdEnv && isKnexError) {
            res.status(status).json({
                status: false,
                message: errorMessage,
                data: null,
                error: { message: errorMessage }
            });
        }
        else
            res.status(status).json({ status: false, message: errorMessage, data: null, error: error_obj });
    }
    next();
}
