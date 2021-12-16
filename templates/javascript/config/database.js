require("dotenv").config();
const dbConfig = require("../sequelize");

module.exports = {
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  pool: dbConfig.pool
};
