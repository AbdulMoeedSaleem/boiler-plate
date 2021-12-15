const { JWK, JWT } = require("jose");
const pick = require("lodash/pick");

const config = require("../../config/app");

//#region configuration variables
const jwtConfig = config.auth;

// JWT Access-token key and sign-options
const tokenSecretKey = jwtConfig.key;
const tokenGenerationKey = JWK.asKey(tokenSecretKey);
const tokenSignOptions = {
  audience: jwtConfig.audience,
  expiresIn: jwtConfig.expiresIn,
};

// JWT Refresh-token key and sign-options
const refreshSecretKey = jwtConfig.refresh_key;
const refreshGenerationKey = JWK.asKey(refreshSecretKey);
const refreshSignOption = {
  audience: jwtConfig.audience,
  expiresIn: jwtConfig.refreshExpiresIn,
};
//#endregion

//#region private functions

/**
 * @returns {String} - Refresh token
 */
function _generateRefreshToken(hostname, user) {
  const payload = {};
  payload.iss = hostname;
  payload.user = user.id;
  return JWT.sign(payload, refreshGenerationKey, refreshSignOption);
}

//#endregion

//#region Public functions

/**
 *
 * @param {Object} user
 * @param {String} user.id
 * @param {String} user.fullname
 * @returns {String} JWT signature
 */
function generateAccessToken(data) {
  const tokenPayload = {};
  tokenPayload.id = data.id
  tokenPayload.full_name = data.full_name;
  tokenPayload.role = data.role.name;

  /* 
  * Sets this property to support legacy tokens. 
  * Validate the token in redis cache 
  * if token has this property at the time of token validation.
  */
  tokenPayload.authType = '2020';
  return JWT.sign(tokenPayload, tokenGenerationKey, tokenSignOptions);
}

/**
 *
 * @param {*} data
 */
function generateLoginTokens(hostname, data) {
  const accessToken = generateAccessToken(data);
  const refreshToken = _generateRefreshToken(hostname, data);

  return { accessToken, refreshToken };
}

//#endregion

module.exports = {
  generateLoginTokens,
  generateAccessToken,
};
