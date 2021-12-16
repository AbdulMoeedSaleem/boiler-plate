const pickBy = require("lodash/pickBy");
const identity = require("lodash/identity");

const jwtAccessTokenDefaultExpiry = "5 mins";
const jwtRefreshTokenDefaultExpiry = "360 days";
const jwtAudienceDefault = "project-mbq";
const redisHostDefault = "localhost";
const redisHostPort = "6379";

// Environment Variables
const port = process.env.PORT;
const environment = process.env.NODE_ENV;

// JWT Config (Access-token / Refresh-token)
const auth_key = process.env.jwt_auth_key;
const auth_tokenExpiry =
  process.env.jwt_access_expiry || jwtAccessTokenDefaultExpiry;
const auth_refreshTokenExpiry =
  process.env.jwt_refresh_expiry || jwtRefreshTokenDefaultExpiry;
const auth_refreshKey = process.env.jwt_refresh_key;
const auth_audience = process.env.jwt_audience || jwtAudienceDefault;


// Redis Config
const redisHost = process.env.redis_host || redisHostDefault;
const redisPort = process.env.redis_port || redisHostPort;

// Database per query limit
const db_pagination_limit = process.env.db_pagination_limit;

// Middlewares path which are loading dynamically in the code
const middlewares = [
  { url: "./middlewares/response", pos: "before" },
  { url: "./middlewares/session", pos: "before" },
  { url: "./middlewares/error", pos: "after" }
];

// Authentication Config - JWT
const auth_exemptPath = [
  "/",
  "/dashboard/user/login",
  "/customer/user/login",
  "/customer/user/signup",
  "/test",
];
const auth_encryptKey = [4, 0, 8, 5, 1, 2, 3, 7, 9, 9, 9, 9, 4, 3, 5, 2];
const authenticationConfiguration = {
  key: auth_key,
  refresh_key: auth_refreshKey,
  audience: auth_audience,
  expiresIn: auth_tokenExpiry,
  refreshExpiresIn: auth_refreshTokenExpiry,
  exempt: auth_exemptPath,
  encryptKey: auth_encryptKey,
};

// Redis Config
const redisConfiguration = {
  host: redisHost,
  port: redisPort,
};

const config = {
  PORT: port,
  ENVIRONMENT: environment,
  auth: authenticationConfiguration,
  redis: redisConfiguration,
  middlewares: middlewares,
  pagination: { limit: db_pagination_limit },
};

module.exports = config;
