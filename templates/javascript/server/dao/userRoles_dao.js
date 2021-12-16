const BaseDao = require("./base_dao");

class UserRolesDao extends BaseDao {
    constructor() {
        super("user_roles");
    }
}

module.exports = new UserRolesDao();
