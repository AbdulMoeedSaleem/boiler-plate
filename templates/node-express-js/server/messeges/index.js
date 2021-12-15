const successMsg = require("./success");
const errorMsg = require("./error");
exports.error = (code) => {
    return errorMsg[code];
};

exports.success = (code, module_name) => {
    return `${module_name} ${successMsg[code]}`;
};