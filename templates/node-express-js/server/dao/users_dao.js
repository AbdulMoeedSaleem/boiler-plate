const BaseDao = require("./base_dao");
const models = require("../../sequelize/index")

class UsersDao extends BaseDao {
    constructor() {
        super("users");
    }

    async getDetailById(id) {
        return await this.getOne({
            filter: {
                id
            },
            include: [
                {
                    model: models.roles,
                    as: "roles",
                    attributes: ["name"],
                    required: true
                }
            ]
        });
    }
}

module.exports = new UsersDao();
