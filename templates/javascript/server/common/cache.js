const redis = require("redis");
const { promisify } = require("util");
const appConfig = require('../../config/app');

const REDIS_HOST = appConfig.redis.host;
const REDIS_PORT = appConfig.redis.port;
const TOKEN_CACHE_PREFIX = "project-tokens-";

const redisClientConfig = {
  prefix: TOKEN_CACHE_PREFIX,
  host: REDIS_HOST,
  port: REDIS_PORT,
};

const authTokenExpiry = 5 * 60; // DEPENDING AUTH TOKEN EXPIRY
const authRedisClient = redis.createClient(redisClientConfig);

authRedisClient.on("error", function (error) {
  console.error("Redis client connectivity failed");
  console.error(error);
});

authRedisClient.on("connect", function (error) {
  if(error) console.error("Redis client connection failed",error)
});

const authCacheDel = promisify(authRedisClient.del).bind(authRedisClient);
const authCacheGet = promisify(authRedisClient.get).bind(authRedisClient);
const authCacheSet = promisify(authRedisClient.setex).bind(authRedisClient);

const _authKeyFormatter = (token) => {
  return `${token}`;
};


const setAuthToken = async (token, user) => {
  const key = _authKeyFormatter(token);
  const userStringify = JSON.stringify(user);
  return authCacheSet(key, authTokenExpiry.toString(), userStringify);
};

const getAuthToken = async (token) => {
  const key = _authKeyFormatter(token);
  return authCacheGet(key);
};

const delAuthToken = async (token) => {
  const key = _authKeyFormatter(token);
  return authCacheDel(key);
};


module.exports = {
  setAuthToken,
  getAuthToken,
  delAuthToken,
};
