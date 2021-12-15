const isEmpty = require("lodash/isEmpty");
const passport = require("passport");
const ExtractJwt = require("passport-jwt").ExtractJwt;
const { match } = require("path-to-regexp");

const jwtStrategy = require("./jwtStrategy");
const {
  authExcludePaths,
  optionalAuthExcludePaths,
} = require("./excludePaths");

passport.use(jwtStrategy);

const jwtAuthenticateMiddleware = passport.authenticate("jwt", { session: false });

function authenticate(req, res, next) {
  const reqPath = req.path;

  const isPathMatchTheExcludePaths = authExcludePaths.some((excPath) => {
    const _match = match(excPath);
    const isMatched = _match(reqPath);
    return !!isMatched;
  });

  const isPathMatchTheOptionalExclPaths = optionalAuthExcludePaths.some(
    (excPath) => {
      const _match = match(excPath);
      const isMatched = _match(reqPath);

      // parse the access-token from request using passport-jwt extractor
      const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      return isMatched && isEmpty(accessToken);
    }
  );
  if (isPathMatchTheExcludePaths || isPathMatchTheOptionalExclPaths) {
    return next();
  } else {
    return jwtAuthenticateMiddleware(req, res, next)
  };
}

module.exports = function (app) {
  app.use(passport.initialize());
  app.use(authenticate);
};
