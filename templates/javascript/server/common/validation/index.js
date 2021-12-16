const { validationResult } = require('express-validator');
const httpStatus = require("http-status")

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendError(errors.array().map(er => `${er.msg} ${er.param}`, errors.array()?.[0], httpStatus.BAD_REQUEST))
    }
    next()
}

module.exports = {
    validate,
    auth: require("./auth"),
}