const express = require("express");
const router = express.Router();


router.use("/auth", require("./auth/auth_router"));
router.use("/user", require("./user/user_routes"));

module.exports = router;