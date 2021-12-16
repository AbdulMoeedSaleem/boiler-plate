
/**
 * NOTE: This middleware is not in-use. 
 * Authentication has been performed by passport-js
 * Have a look into below file for the authentication implementation
 * my-book-app-server-v2/server/common/passport/jwtStrategy.js
 */

const { verify } = require("../../library/auth");
const appConfig = require("../../config/app");

module.exports = (req, res, next) => {
    const authorization = (req.get('Authorization') || req.headers['Authorization'] || 'undefined').toString();
    if (authorization !== 'undefined') {
        let auth = authorization.toString().split(" ")[1];

        if (auth) {
            //@Todo : Implement verification here
            auth = verify(auth);
            if (auth.aud === appConfig.auth.audience) {
                req["user"] = { "id": auth.id, "role": auth.role };
                next()
            } else {
                res.sendError(null, "Your authentication token has been expired !", 401);
                // res.status("401").json({ message: "project dosen't meets" })
            }
        } else {
            next()
        }
    } else {
        const pattDashboard = new RegExp("dashboard");
        const pattAnalytics = new RegExp("analytics");
        const pattMedia = new RegExp("media");
        if (pattDashboard.exec(req.path) || pattMedia.exec(req.path) || pattAnalytics.exec(req.path)) {
            if (req.path.indexOf("login") > -1 || req.path.indexOf("api-docs") > -1 || req.path.indexOf("forgot") > -1 || req.path.indexOf("reset-code") > -1 || req.path.indexOf("update-password") > -1 || req.path.indexOf("order-status") > 1) {
                next()
            } else {
                // next()
                res.sendError(null, "Un-Authorized user !", 401);
            }
        } else {
            next()
        }
    }
}