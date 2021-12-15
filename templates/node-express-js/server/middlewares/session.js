const { error } = require("../messeges");
const { decrypt } = require("../../library/encryption");
const { isEmpty } = require("lodash");
const dao = require("../dao")



function appZoneHeaderData(req) {
  const appZoneHeaderData = req.get("app_zone") || req.headers["app_zone"] || "Asia/Karachi";
  return appZoneHeaderData.toString();
}

function appVersion(req) {
  return req.get("app_version") || req.headers["app_version"] || undefined;
}

function deviceId(req) {
  return req.get("device_id") || req.headers["device_id"] || undefined;
}

function pushToken(req) {
  return req.get("push_token") || req.headers["push_token"] || undefined;
}

module.exports = async (req, res, next) => {
  req.app_zone = appZoneHeaderData(req);
  req.app_version = appVersion(req);
  req.device_id = deviceId(req);
  // req.push_token = pushToken(req);
  const isPushTokenEmpty = isEmpty(pushToken(req))
  const isDeviceIdEmpty = isEmpty(deviceId(req));
  if (isDeviceIdEmpty) {
    next();
    return;
  }

  try {
    if (req.user) { // New push_token for FCM
      const data = [{
        user_id: req.user ? req.user.id : null,
        device_id: req.device_id,
        // push_token: req.push_token,
      }]
      // await dao.sessions.multiCreate(data, {
      //   fields: ["id", "user_id", "device_id", "push_token"],
      //   updateOnDuplicate: ["push_token"]
      // })
    }
    next();
  } catch (err) {
    console.error("Session middleware exception", err.message);
    res.sendError(null, error("serverError").message);
    return;
  }
};
