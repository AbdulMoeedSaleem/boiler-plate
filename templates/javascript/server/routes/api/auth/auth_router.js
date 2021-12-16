const express = require("express");
const omit = require("lodash/omit");
const pick = require("lodash/pick");

const authController = require("./auth_controller");
const httpStatus = require("http-status");
const router = express.Router();
const validator = require("../../../common/validation")

/**
 * @method POST /api/v1/auth/login
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.phone
 * @return {access} - data
 */
router.post("/login", validator.auth.login, validator.validate, async (req, res) => {
    const { phone } = req.body;
    const response = await authController.login(phone);
    const status = response.status || httpStatus.OK;
    if (status === httpStatus.OK) {
        const message = "OTP";
        res.sendJSON({ otp: response.otp }, message, status);
    } else {
        const error = response.error;
        const message = "Login failed";
        res.sendError(error, message, status);
    }
});


/**
 * @method POST /api/v1/auth/signup
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.phone
 * @return {access} - data
 */
router.post("/signup", validator.auth.signup, validator.validate, async (req, res) => {
    const { phone } = req.body;
    const response = await authController.login(phone); // SIGN UP STRAGETY
    const status = response.status || httpStatus.OK;
    if (status === httpStatus.OK) {
        const message = "OTP";
        res.sendJSON({ otp: response.otp }, message, status);
    } else {
        const error = response.error;
        const message = "Login failed";
        res.sendError(error, message, status);
    }
});

/**
 * @method POST /api/v1/auth/phone/verify
 * @param {Object} req
 * @param {Object} req.body
 * @param {string} req.body.phone
 * @return {access} - data
 */
router.post("/phone/verify", validator.auth.verifyNumber, validator.validate, async (req, res) => {
    const { device_id, body } = req;
    const { phone, otp } = body;
    const response = await authController.login(req.hostname, phone, otp, device_id);
    const status = response.status || httpStatus.OK;
    if (status === httpStatus.OK) {
        const returnObj = omit(response, ["status"]);
        const message = "Logged-in Successfully";
        res.sendJSON(returnObj, message, status);
    } else {
        const error = response.error;
        const message = "Login failed";
        res.sendError(error, message, status);
    }
});

/**
 * @method POST /api/v1/auth/token
 * @summary Generate new access-token for a user through the refresh-token
 */
router.post("/token", async (req, res) => {
    const response = await authController.generateToken(req.body);
    if (response.status === 200)
        res.sendJSON(response, response.message, response.status);
    else res.sendError(response, response.message, response.status);
});

/**
 * @method POST /api/v1/auth/revoke-token
 * @summary Revoke a user's refresh-token
 */
router.post("/token/revoke", async (req, res) => {
    const options = pick(req, ["device_id", "app_id", "user"]);
    const response = await authController.revokeToken(req.body, options);
    res.sendJSON(null, response.message, response.status);
});

/**
 * @method POST /api/v1/auth/logout
 * @summary Logout a user
 */
router.post("/logout", async (req, res) => {
    const options = pick(req, ["device_id", "app_id", "user"]);
    const response = await authController.logout(req.body, options);
    res.sendJSON(null, response.message, response.status);
});

module.exports = router;
