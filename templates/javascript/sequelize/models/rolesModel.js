const { DataTypes } = require('sequelize');

module.exports = function (sequelize) {
    const Roles = sequelize.define(
        'roles',
        {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING,
            },
            is_active: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: true },
            is_deleted: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false },
            deleted_at: { type: DataTypes.DATE, allowNull: true },
        },
        {
            indexes: [
                {
                    name: "roles_id_fIndex",
                    fields: ["id"],
                },
                {
                    name: "roles_name_fIndex",
                    fields: ["name"],
                },
            ],
            underscoredAll: true,
            underscored: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            classMethods: {
                associate: function (models) {
                    models.roles.belongsToMany(models.users, {
                        through: models.user_roles,
                        foreignKey: 'role_id'
                    });
                    models.roles.hasMany(models.user_roles, {
                        foreignKey: { name: "role_id", allowNull: false },
                        as: "user_role"
                    });
                },
            },
        },
    );
    return Roles;
};
