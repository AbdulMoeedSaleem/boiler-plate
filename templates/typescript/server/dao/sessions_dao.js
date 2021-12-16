const BaseDao = require("./base_dao");
const { isEmpty } = require("lodash");
class SessionsDao extends BaseDao {
    constructor() {
        super("sessions");
    }

    async getByRefreshToken(refresh_token) {
        return await this.getOne({
            filter: {
                refresh_token
            },
            attributes: ["refresh_token", "user_id"]
        })
    }
    async updateRefreshTokenExpiry(refresh_token, expiry) {
        return await this.updateByFilter({ refresh_token }, { expiry })
    }

    async revokeRefreshToken(refresh_token) {
        if (isEmpty(refresh_token)) return true;
        return await this.destroy({ where: { refresh_token } });
    }

    async removeUserByDevice(deviceId, user_id) {
        const whereFilter = {
            device_id: deviceId,
            user_id,
        };
        try {
            return await this.updateByFilter(whereFilter, { user_id });
        } catch (ex) {
            return ex.errorMessage;
        }
    };
}

module.exports = new SessionsDao();
