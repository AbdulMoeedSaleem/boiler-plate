const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
    const UserRoles = sequelize.define(
        "user_roles",
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            user_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            role_id: {
                allowNull: false,
                type: DataTypes.INTEGER,
                references: {
                    model: "roles",
                    key: "id",
                },
            },
        },
        {
            indexes: [
                {
                    name: "user_roles_user_id_fIndex",
                    fields: ["user_id"],
                },
                {
                    name: "user_roles_role_id_fIndex",
                    fields: ["role_id"],
                },
                {
                    name: "user_roles_users_unique",
                    fields: ["user_id", "role_id"],
                    unique: true
                },

            ],
            underscoredAll: true,
            underscored: true,
            timestamps: false,
        }
    );
    return UserRoles;
};
