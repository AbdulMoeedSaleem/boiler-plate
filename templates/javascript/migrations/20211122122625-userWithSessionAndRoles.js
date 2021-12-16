"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable("users", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        full_name: { type: Sequelize.DataTypes.STRING },
        phone: { type: Sequelize.DataTypes.STRING, allowNull: false },
        password: { type: Sequelize.DataTypes.STRING },
        email: { type: Sequelize.DataTypes.STRING },
        is_active: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: true },
        is_verified: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        is_deleted: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        created_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updated_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        deleted_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        },
        image: {
          type: Sequelize.DataTypes.TEXT,
          allowNull: true,
        },
        dob: { type: Sequelize.DataTypes.DATEONLY, allowNull: true },
        gender: { allowNull: false, type: Sequelize.DataTypes.STRING(20) },
      }, { transaction });

      await queryInterface.createTable("roles", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        name: { type: Sequelize.DataTypes.STRING, allowNull: false },
        is_active: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: true },
        is_deleted: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
        created_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updated_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        deleted_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: true,
        },
      }, { transaction });

      await queryInterface.createTable("user_roles", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        user_id: {
          allowNull: false,
          type: Sequelize.DataTypes.INTEGER,
          references: { model: "users", key: "id" }
        },
        role_id: {
          allowNull: false,
          type: Sequelize.DataTypes.INTEGER,
          references: { model: "roles", key: "id" }
        },
      }, { transaction });

      await queryInterface.createTable("sessions", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.DataTypes.INTEGER,
        },
        user_id: {
          allowNull: false,
          type: Sequelize.DataTypes.INTEGER,
          references: { model: "users", key: "id" }
        },
        device_id: {
          allowNull: true,
          type: Sequelize.DataTypes.STRING,
        },
        push_token: {
          allowNull: true,
          type: Sequelize.DataTypes.STRING,
        },
        refresh_token: {
          allowNull: true,
          type: Sequelize.DataTypes.TEXT,
        },
        expiry: {
          allowNull: true,
          type: Sequelize.DataTypes.DATE,
        },
        created_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },
        updated_at: {
          type: Sequelize.DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn("NOW"),
        },

      }, { transaction });

      // INDEXES FOR USER
      await queryInterface.addIndex("users", ["id"], { name: "users_id_fIndex", transaction });
      await queryInterface.addIndex("users", ["phone"], { name: "users_phone_fIndex", transaction });
      await queryInterface.addIndex("users", ["email"], { name: "users_email_fIndex", transaction });
      await queryInterface.addIndex("users", ["is_active", "is_deleted", "is_verified"], { name: "users_composite_fIndex", transaction });
      await queryInterface.addIndex("users", ["is_deleted"], { name: "users_is_deleted_fIndex", transaction });

      // INDEXES FOR ROLES
      await queryInterface.addIndex("roles", ["id"], { name: "roles_id_fIndex", transaction });
      await queryInterface.addIndex("roles", ["name"], { name: "roles_name_fIndex", transaction });

      // INDEXES FOR USER ROLES
      await queryInterface.addIndex("user_roles", ["user_id"], { name: "user_roles_user_id_fIndex", transaction });
      await queryInterface.addIndex("user_roles", ["role_id"], { name: "user_roles_role_id_fIndex", transaction });
      await queryInterface.addIndex("user_roles", ["user_id", "role_id"], { name: "user_roles_users_unique", unique: true, transaction });

      // INDEXES FOR SESSIONS
      await queryInterface.addIndex("sessions", ["user_id"], { name: "sessions_user_id_fIndex", transaction });
      await queryInterface.addIndex("sessions", ["expiry"], { name: "sessions_expiry_fIndex", transaction });
      await queryInterface.addIndex("sessions", ["user_id", "device_id"], { name: "sessions_users_unique", unique: true, transaction });

      return await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    };
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
    await queryInterface.dropTable("roles");
    await queryInterface.dropTable("user_roles");
    await queryInterface.dropTable("session");
    return;
  }
};
