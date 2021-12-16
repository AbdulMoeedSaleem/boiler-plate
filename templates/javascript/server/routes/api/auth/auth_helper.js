const moment = require("moment");

const config = require("../../../../config/app");

const jwtConfig = config.auth;
const accessExpiry = jwtConfig.expiresIn;
const refreshExpiry = jwtConfig.refreshExpiresIn;

function getRefreshTokenExpiry() {
    let [amount, duration] = refreshExpiry.split(" ");
    if (duration === "mins") duration = "minutes";
    const date = moment(new Date()).add(amount, duration);
    return date;
}
exports.getRefreshTokenExpiry = getRefreshTokenExpiry;

exports.transformCreateSession = (user, tokens) => {
    const response = {};
    response.refresh_token = tokens.refreshToken;
    response.expiry = getRefreshTokenExpiry();
    response.user_id = user.id;
    return response;
};

exports.loginResponse = (user, tokens) => {
    const response = {};
    response.user = user;
    response.access_token = tokens.accessToken;
    response.refresh_token = tokens.refreshToken;
    response.expires_in = accessExpiry;
    response.refresh_expires_in = refreshExpiry;
    return response;
};
