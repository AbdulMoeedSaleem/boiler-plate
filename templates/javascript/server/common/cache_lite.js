const NodeCache = require("node-cache");

const authTokenExpiry = 5 * 60; // DEPENDING AUTH TOKEN EXPIRY
const myCache = new NodeCache();

const _authKeyFormatter = (token) => {
  return `${token}`;
};


const setAuthToken = async (token, user) => {
  const key = _authKeyFormatter(token);
  const userStringify = JSON.stringify(user);
  return myCache.set(key, userStringify, authTokenExpiry.toString());
};

const getAuthToken = async (token) => {
  const key = _authKeyFormatter(token);
  return myCache.get(key);
};

const delAuthToken = async (token) => {
  const key = _authKeyFormatter(token);
  return myCache.del(key);
};


module.exports = {
  setAuthToken,
  getAuthToken,
  delAuthToken,
};
