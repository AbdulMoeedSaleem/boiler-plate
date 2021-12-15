const { DataTypes, literal } = require("sequelize");

module.exports = function (sequelize) {
  const Users = sequelize.define(
    "users",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      full_name: {
        type: DataTypes.STRING,
      },
      phone: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        validate: {
          notEmpty: { msg: "phone cannot be empty" },
        },
      },
      email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: { args: true, msg: "Please provide a valid email format" },
        },
      },
      password: {
        type: DataTypes.STRING,
        get() {
          return "********";
        },
      },
      is_active: {
        allowNull: false,
        defaultValue: true,
        type: DataTypes.BOOLEAN
      },
      is_verified: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      is_deleted: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gender: { allowNull: false, type: DataTypes.STRING(20), defaultValue: 'male' },
    },
    {
      indexes: [
        {
          name: "users_id_fIndex",
          fields: ["id"],
        },
        {
          name: "users_phone_fIndex",
          fields: ["phone"],
        },
        {
          name: "users_email_fIndex",
          fields: ["email"],
        },
        {
          name: "users_composite_fIndex",
          fields: ["is_active", "is_deleted", "is_verified"],
        },
        {
          name: "users_is_deleted_fIndex",
          fields: ["is_deleted"],
        },
      ],
      classMethods: {
        associate: function (models) {
          models.users.belongsToMany(models.roles, {
            through: models.user_roles,
            foreignKey: { name: "user_id", allowNull: false },
            as: "roles"
          });
          models.users.hasMany(models.sessions, {
            foreignKey: { name: "user_id", allowNull: false },
            as: "sessions"
          });
        },
      },
      underscoredAll: true,
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Users;
};
