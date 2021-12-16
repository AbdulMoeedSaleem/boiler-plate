const authExcludePaths = [];

// api prefix routes
authExcludePaths.push("/api/v1/auth/phone");
authExcludePaths.push("/api/v1/auth/phone/verify");
authExcludePaths.push("/api/v1/auth/phone/signup");
authExcludePaths.push("/api/v1/auth/login");
authExcludePaths.push("/api/v1/auth/token");
authExcludePaths.push("/test");



const optionalAuthExcludePaths = Array();
optionalAuthExcludePaths.push("/api/v1/home");

module.exports = { authExcludePaths, optionalAuthExcludePaths };
