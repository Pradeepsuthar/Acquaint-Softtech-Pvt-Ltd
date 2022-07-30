const jwt = require("jsonwebtoken");
const responseHelper = require("../common/responseHelper");
const utils = require("../common/utils");
const config = require("../config/config");
const DB = require("../common/dbmanager");
const DBManager = new DB();

module.exports = {
  verifyToken: async function (req, res, next) {
    var response = {
      status: false,
      message: "Invalid Authorization",
    };

    var method = req.method;
    if (method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    } else {
      try {
        const authHeader =
          req.body.token || req.query.token || req.headers["authorization"];

        if (authHeader) {
          req.user = await utils.verifyUser(authHeader);
          var { userId } = req.user || {};
          if (userId) {
            var resultUser = await DBManager.getData("users_master", "*", {
              user_id: userId,
              status: "active",
            });
            var rowUser = resultUser?.rows?.[0] || {};
            if (rowUser && rowUser.user_id) {
              next();
            } else {
              response.message = "Account is not active";
              return responseHelper.respondSuccess(res, 401, response);
            }
          } else {
            next();
          }
        } else {
          return responseHelper.respondSuccess(res, 401, response);
        }
      } catch (error) {
        return responseHelper.respondError(res, error);
      }
    }
  },

  verifyAdminToken: async function (req, res, next) {
    var response = {
      status: false,
      message: "Invalid Authorization",
    };
    var method = req.method;

    if (method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    } else {
      try {
        const authHeader = req.headers["authorization"];
        if (authHeader) {
          req.admin = await utils.verifyAdmin(authHeader);
          next();
        } else {
          return responseHelper.respondSuccess(res, 401, response);
        }
      } catch (error) {
        return responseHelper.respondError(res, error);
      }
    }
  },

  verifyApiKey: function (req, res, next) {
    var response = {
      status: false,
      message: "Invalid Request, Missing Key",
    };

    var method = req.method;

    if (method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Access-Control-Allow-Origin", "*");
      next();
    } else {
      try {
        const authHeader = req.headers["x-api-key"] || "";
        if (
          authHeader &&
          authHeader != "" &&
          authHeader === config.MOBILE_API_KEY
        ) {
          next();
        } else {
          return responseHelper.respondSuccess(res, 200, response);
        }
      } catch (error) {
        return responseHelper.respondError(res, error);
      }
    }
  },
};
