const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  const Sessions = sequelize.define(
    "sessions",
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

      device_id: {
        type: DataTypes.STRING,
      },

      push_token: {
        type: DataTypes.STRING,
      },

      refresh_token: {
        type: DataTypes.STRING,
      },
      expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      indexes: [
        {
          name: "sessions_user_id_fIndex",
          fields: ["user_id"],
        },
        {
          name: "sessions_expiry_fIndex",
          fields: ["expiry"],
        },
        {
          name: "sessions_device_id_unique",
          fields: ["expiry"],
        },
        {
          name: "sessions_users_unique",
          fields: ["user_id", "device_id"],
          unique: true
        },
      ],
      classMethods: {
        associate: function (models) {
          models.sessions.belongsTo(models.users, {
            foreignKey: {
              name: "user_id",
              allowNull: false
            }, as: "user",
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
  return Sessions;
};
