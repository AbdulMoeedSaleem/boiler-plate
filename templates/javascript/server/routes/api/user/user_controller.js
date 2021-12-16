const dao = require("../../../dao");
const httpStatus = require("http-status");


const messages = {
    USER_NOT_FOUND: "Record not found",
    SUCCESS_USER: "User DETAIL",
    INTERNAL_SERVER_ERROR: "Internal Server Error"
};

/**
 * @describe - Provide User Data by Id
 * @param {String} id - user id to get detail
 * @returns {Object} - 200.Response - Object with user detail
 * @returns {String} - 404.Response - User Not Found
 */
async function getUserDetail(id) {
    try {
        const record = await dao.users.getDetailById(id);
        if (record) return { status: httpStatus.OK, data: record, message: messages.SUCCESS_USER };
        else return { status: httpStatus.NOT_FOUND, error: null, message: messages.USER_NOT_FOUND }

    } catch (error) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, error, message: messages.INTERNAL_SERVER_ERROR }
    }
}


/**
 * @describe - Update User
 * @param {String} id - id to be updated
 * @param {Object} user_object - Params to be updated
 * @returns {Object} - 200.Response - Object with user detail
 * @returns {String} - 400.Response - BAD REQUEST
 */
async function updateUser(id, payload) {
    try {
        console.log({ id, payload })
        const record = await dao.users.update(id, payload);
        if (record) return { status: httpStatus.OK, data: record[1], message: messages.SUCCESS_USER };
        else return { status: httpStatus.NOT_FOUND, error: null, message: messages.USER_NOT_FOUND }
    } catch (error) {
        return { status: httpStatus.INTERNAL_SERVER_ERROR, error, message: messages.INTERNAL_SERVER_ERROR }
    }
}


module.exports = {
    getUserDetail,
    updateUser
}