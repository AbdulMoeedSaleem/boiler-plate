const express = require("express");
const omit = require("lodash/omit");
const pick = require("lodash/pick");

const userController = require("./user_controller");
const httpStatus = require("http-status");
const router = express.Router();

/**
 * @method GET /api/v1/user/get
 * @param {Object} req
 * @param {Object} req.user
 * @param {string} req.user.id
 * @return {access} - data
 */
router.get("/get", async (req, res) => {
    const { id } = req.user;
    console.log({ device_id: req.device_id })
    const response = await userController.getUserDetail(id);
    const status = response.status || httpStatus.OK;
    if (status === httpStatus.OK) {
        res.sendJSON(response.data, response.message, status);
    } else {
        const error = response.error;
        const message = response.message;
        res.sendError(error, message, status);
    }
});

/**
 * @method PUT /api/v1/user/update
 * @param {Object} req
 * @param {Object} req.user
 * @param {string} req.user.id
 * @return {access} - data
 */
router.put("/update", async (req, res) => {
    const payload = { ...req.body };
    const { id } = req.user;
    const response = await userController.updateUser(id, payload);
    const status = response.status || httpStatus.OK;
    if (status === httpStatus.OK) {
        res.sendJSON(response.data, response.message, status);
    } else {
        const error = response.error;
        const message = response.message;
        res.sendError(error, message, status);
    }
});


module.exports = router;
