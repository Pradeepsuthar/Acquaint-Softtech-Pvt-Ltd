// Dependencies
const config = require("./config");
const routes = require("./../routes/routes");
const express = require("express");

const initApp = function () {
  // Init
  let app = express();
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");
  app.use(express.static(__dirname + "./../uploads"));

  // Config
  app.set("port", config.PORT);

  // for parsing application/x-www-form-urlencoded
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  // for parsing application/json
  app.use(express.json());

  // for parsing multipart/form-data

  // Setup routes
  routes(app);

  return app;
};

module.exports = initApp;
