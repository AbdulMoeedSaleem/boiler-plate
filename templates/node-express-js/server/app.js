const express = require("express");

const helmet = require("helmet");

const { middlewares } = require("../config/app");

const passportUtil = require("./common/passport");

const app = express();

app.use(helmet());


//request body parsing
app.use(express.json());

app.use(express.urlencoded({ limit: "2mb", extended: false }));

// @Todo: below file should server directly from web-server
// app.get("/:env/privacy-policy", function (req, res, next) {
//   res.sendFile(`${__dirname}/privacy-policy.html`);
// });

// loading passport util for authentication
passportUtil(app);

// calling middleware
middlewares.forEach((middleware) => {
  if (middleware.pos === "before") {
    const check = app.use(require(middleware.url));
  }
});

app.use(require("./routes/index_router"));

// calling middleware
middlewares.forEach((middleware) => {
  if (middleware.pos === "after") {
    app.use(require(middleware.url));
  }
});

module.exports = app;
