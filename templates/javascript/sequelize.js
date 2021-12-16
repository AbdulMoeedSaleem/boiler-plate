const dialectDefault = "postgres";
const dbCharsetDefault = "utf8";
const dbMaxPoolDefault = 2;

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbCharset = process.env.dbCharset || dbCharsetDefault;
const dbMaxPool = process.env.db_max_pool || dbMaxPoolDefault;

module.exports = {
  port: dbPort,
  host: dbHost,
  database: dbName,
  username: dbUser,
  password: dbPassword,
  dialect: dialectDefault,
  charset: dbCharset,
  dialectOptions: {
    collate: "utf8_general_ci",
  },

  pool: { min: 1, max: parseInt(dbMaxPool) },

  logging: console.log,

  define: { timestamps: false, underscoredAll: true, underscored: true },

  // Use a different storage. Default: none
  // seederStorage: "sequelize",

  // Use a different file name. Default: sequelize-data.json
  // seederStoragePath: path.resolve("sequelize", "sequelizeDataSeeder.json"),

  // Use a different table name. Default: SequelizeData
  // seederStorageTableName: "sequelize_data_seeder",

  // Use a different storage type. Default: sequelize
  // migrationStorage: "sequelize",

  // Use a different file name. Default: sequelize-meta.json
  // migrationStoragePath: path.resolve(
  //   "sequelize",
  //   "sequelizeMetaMigration.json"
  // ),

  // Use a different table name. Default: SequelizeMeta
  // migrationStorageTableName: "sequelize_meta_migration",
};
