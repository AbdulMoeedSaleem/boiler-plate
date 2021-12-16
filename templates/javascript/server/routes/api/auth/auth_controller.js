const isEqual = require("lodash/isEqual");
const isEmpty = require("lodash/isEmpty");
const isNull = require("lodash/isNull");
const { encrypt, decrypt } = require("../../../../library/encryption");

const httpStatus = require("http-status");
const moment = require("moment");

const dao = require("../../../dao");
const cache = require("../../../common/cache");
const authLibrary = require("../../../common/auth_v2");
const {
    transformCreateSession,
    loginResponse,
    getRefreshTokenExpiry,
} = require("./auth_helper");


const messages = {
    ERROR_USER_INVALID_CREDENTIALS: "Invalid credentials",
    ERROR_TOKEN_EXPIRED: "Refresh token expired",
    ERROR_RECORD_NOT_FOUND: "Record not found",
    SUCCESS_TOKEN_REVOKED: "User token revoked",
    SUCCESS_LOGOUT_SUCCESS: "Logout successfully",
    SUCCESS_TOKEN_ISSUED: "Token issued",
};


/**
 * @describe - Provide OTP to user
 * @param {String} phone - Phone Where otp is to be sent
 * @returns {Object} - 200.Response - Object with user detail and auth tokens
 * @returns {String} - 400.Response - Login request failed
 */
async function generateOTP(phone) {
    // const otp = generateRandomNumbers();
    const otp = 1234;
    return { status: httpStatus.OK, otp, phone };
}

/**
 * @describe - Validate the user through email/mobile along-with the password
 * After successful validation
 * 1- Add entry in sessions table
 * 2- Add entry in redis
 * @param {String} hostname - Hostname of the server from which request receives
 * @param {Object} body - Request body having authenticate user credentials
 * @param {Object} body.mobile - Mobile number of a user to authenticate
 * @param {String} body.email - Email address of a user to authenticate
 * @param {String} body.password - Password of a user to authenticate
 * @returns {Object} - 200.Response - Object with user detail and auth tokens
 * @returns {String} - 400.Response - Login request failed
 */
async function login(hostname, phone, password) {
    const payload = {
        phone,
        password: encrypt(password)
    }
    let user = null;
    user = await dao.users.getOne({ filter: payload });
    if (isEmpty(user)) {
        return {
            status: httpStatus.NOT_FOUND,
            error: messages.ERROR_USER_INVALID_CREDENTIALS,
        };
    }
    const userId = user.id;
    user.role = await dao.roles.getByUserId(userId);
    if (!user.role) {
        return {
            status: httpStatus.UNAUTHORIZED,
            message: messages.ERROR_USER_INVALID_CREDENTIALS,
        };
    }
    const tokens = authLibrary.generateLoginTokens(hostname, user);
    const sessionEntry = transformCreateSession(user, tokens);
    await dao.sessions.multiCreate([{ ...sessionEntry, device_id }], {
        fields: [...Object.keys(sessionEntry), "id", "device_id"],
        updateOnDuplicate: [...Object.keys(sessionEntry)]
    });
    await cache.setAuthToken(tokens.accessToken, user);
    return { status: httpStatus.OK, ...loginResponse(user, tokens) };
}

/**
 * @description - Generate new access-token through the refresh-token
 * @param {Object} body -
 * @param {String} body.refresh_token
 * @param {String} body.email - Optional
 * @param {String} body.mobile - Optional
 */
async function generateToken(body) {
    const { email, refresh_token, mobile } = body;
    const session = await dao.sessions.getByRefreshToken(refresh_token);
    if (isEmpty(session))
        return {
            status: httpStatus.NOT_FOUND,
            message: messages.ERROR_RECORD_NOT_FOUND,
        };
    if (session.expiry === null || moment(session.expiry).isAfter(new Date()))
        return {
            status: httpStatus.UNAUTHORIZED,
            message: messages.ERROR_TOKEN_EXPIRED,
        };
    const user = await dao.users.getById(session.user_id);
    if (!user) {
        return {
            status: httpStatus.UNAUTHORIZED,
            message: messages.ERROR_USER_INVALID_CREDENTIALS,
        };
    }
    const isEmailMatched = !isEmpty(email) && isEqual(user.email, email);
    const isMobileMatched = !isEmpty(mobile) && isEqual(user.mobile, mobile);
    if (isEmailMatched && isMobileMatched)
        return {
            status: httpStatus.UNAUTHORIZED,
            message: messages.ERROR_USER_INVALID_CREDENTIALS,
        };
    const userId = user.id;
    user.role = await dao.roles.getByUserId(userId);
    if (!user.role) {
        return {
            status: httpStatus.UNAUTHORIZED,
            message: messages.ERROR_USER_INVALID_CREDENTIALS,
        };
    }
    const accessToken = authLibrary.generateAccessToken(user);
    await cache.setAuthToken(accessToken, user);
    console.log("session.refresh_token: ", session.refresh_token)
    await dao.sessions.updateRefreshTokenExpiry(
        session.refresh_token,
        getRefreshTokenExpiry()
    );
    return {
        user,
        access_token: accessToken,
        status: httpStatus.OK,
        message: messages.SUCCESS_TOKEN_ISSUED,
    };
}

// this api should be protected and accessible to admin only
async function revokeToken(body, options) {
    const user = options.user;
    const { phone, refresh_token } = body;
    const session = await dao.sessions.getByRefreshToken(refresh_token);
    const dbUser = await dao.users.getById(session.user_id);
    const isRefreshTokenAndphoneMatched = isEqual(dbUser.phone, phone);
    if (!isRefreshTokenAndphoneMatched)
        return {
            status: httpStatus.UNAUTHORIZED,
            message: messages.ERROR_USER_INVALID_CREDENTIALS,
        };
    await dao.sessions.revokeRefreshToken(refresh_token);
    await cache.delAuthToken(user.accessToken);
    return { status: httpStatus.OK, message: messages.SUCCESS_TOKEN_REVOKED };
}

/**
 *
 * @param {*} body
 * @param {String} body.refresh_token
 * @param {*} user
 * @param {String} user.id
 * @param {String} user.accessToken
 * @param {*} options
 * @param {String} options.device_id
 * @param {String} options.app_id
 */
async function logout(body, options) {
    const user = options.user;
    const deviceId = options.device_id;
    const appId = options.app_id;
    const accessToken = user.accessToken;
    const refreshToken = body.refresh_token;
    await dao.sessions.removeUserByDevice(deviceId, user.id);
    await cache.delAuthToken(accessToken);
    await dao.sessions.revokeRefreshToken(refreshToken);

    return {
        status: httpStatus.OK,
        message: messages.SUCCESS_LOGOUT_SUCCESS,
    };
}

module.exports = {
    generateOTP,
    login,
    logout,
    generateToken,
    revokeToken,
};
