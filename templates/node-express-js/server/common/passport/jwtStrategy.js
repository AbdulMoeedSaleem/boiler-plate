const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const config = require("../../../config/app");
const isEmpty = require("lodash/isEmpty");
const get = require("lodash/get");

//#region configuration variables
const jwtConfig = config.auth;
const tokenSecretKey = jwtConfig.key;
const tokenGenerationKey = tokenSecretKey;

const jwtStrategyOptions = {};

/**
 * JWT token extracted from following location
 * From the Header against the `Authorization` key
 */
jwtStrategyOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

// Setup JWT options
jwtStrategyOptions.secretOrKey = tokenGenerationKey;
jwtStrategyOptions.audience = jwtConfig.audience;
jwtStrategyOptions.passReqToCallback = true;

async function jwtStrategyCallBack(req, payload, done) {

  // parse the access-token from request using passport-jwt extractor
  const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);


  // validate token audience with the app audience
  if (payload.aud !== jwtConfig.audience) {
    // call the passport-jwt verify function with failure
    done(null, false, { message: 'UNAUTHORIZED - wrong audience' });
    return;
  }

  // this will be append in req.user
  const userObjAppendInReq = {
    id: payload.id,
    role: payload.role,
    accessToken: accessToken,
  };

  // call the passport-jwt verify function with success
  done(null, userObjAppendInReq);
}
const jwtStrategy = new JwtStrategy(jwtStrategyOptions, jwtStrategyCallBack);

module.exports = jwtStrategy;
