const BaseDao = require("./base_dao");
const models = require("../../sequelize/index")

class RolesDao extends BaseDao {
    constructor() {
        super("roles");
    }
    async getByUserId(user_id) {
        const payload = {
            filter: {
                is_active: true
            },
            attributes: ["id", "name"],
            include: [
                {
                    model: models.user_roles,
                    as: "user_role",
                    attributes: [],
                    where: { user_id }
                }
            ]
        };
        return await this.getOne(payload)
    }
}

module.exports = new RolesDao();
