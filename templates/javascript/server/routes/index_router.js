const express = require("express");
const fs = require("fs");
const path = require("path");

const logCat = require("../../library/logger")("app");

const router = express.Router();

const currentDirectory = path.join(__dirname);

// Test endpoint to test the token
router.get("/test-auth", async (req, res) => {
  res.status(200).json({ user: req.user });
});
router.get("/test", async (req, res) => {
  res.status(200).json({ message: "WELCOME" });
});

// mount api/v1/... routes
router.use("/api/v1", require(`./api/api_router`));
// router.use("/api/admin", require(`./admin/admin_routes`));

fs.readdirSync(currentDirectory).forEach((file) => {
  // exclude api folder.
  if (["api", "admin"].indexOf(file) >= 0) return;

  // load router.js file from all the directories.
  const absolutePath = `${currentDirectory}/${file}`;
  if (fs.statSync(absolutePath).isDirectory()) {
    logCat(`adding route ${absolutePath}`);
    router.use(`/:env/${file}`, require(`${absolutePath}/routes.js`));
  }
});

module.exports = router;
