'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkInsert("roles", [
      { id: 1, name: "Super Admin" },
      { id: 2, name: "Admin" },
      { id: 3, name: "Consumer" },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete("roles");
  }
};
