//const bcrypt = require("bcrypt");
var config = require("../../config/config");
const fs = require("fs");
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const responseHelper = require("../../common/responseHelper");
const utils = require("../../common/utils");
const DB = require("../../common/dbmanager");
const DBManager = new DB();
const validate = require("../../validations/admin.validation");
const { successMessages, errorMessages } = require('../../common/constants');

module.exports = {
  getDashboardStats: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {
      var dashboardStats = {
        totalDownloads: 0,
        totalSignups: 0,
        totalUsers: 0,
        totalActiveAccount: 0,
        totalActiveAccount30Days: 0,
        totalNewUser30Days: 0,
        totalUser3TaskComplete: 0,
        totalRecommededUp: 0,
        totalRecommededDown: 0,
        totalCashback: 0,
        isSignupPause: false,
      };

      // Total Users
      var resultData = await DBManager.countRecord("users_master", {});
      dashboardStats["totalUsers"] = resultData?.rows?.[0]?.["total"] || 0;

      // Total Active Users
      var resultData = await DBManager.countRecord("users_master", {
        status: "active",
      });
      dashboardStats["totalActiveAccount"] =
        resultData?.rows?.[0]?.["total"] || 0;

      // Total Active Users in last 30 days
      var sqlQry = `SELECT count(*) as total FROM users_master WHERE is_deleted = 0 AND last_login_date::date >= now() - interval '30 day'`;
      var resultData = await DBManager.runQuery(sqlQry);
      dashboardStats["totalActiveAccount30Days"] =
        resultData?.rows?.[0]?.["total"] || 0;

      // Total New Users in last 30 days
      var sqlQry = `SELECT count(*) as total FROM users_master WHERE is_deleted = 0 AND date_created::date >= now() - interval '30 day'`;
      var resultData = await DBManager.runQuery(sqlQry);
      dashboardStats["totalNewUser30Days"] =
        resultData?.rows?.[0]?.["total"] || 0;

      var isRegisterAllow = await DBManager.getKeyValue(
        "app_settings",
        "setting_value",
        { setting_key: "new_register_allow" }
      );
      dashboardStats["isSignupPause"] = isRegisterAllow === "0" ? true : false;

      response = {
        status: true,
        message: "Success",
        data: dashboardStats,
      };

      return responseHelper.respondSuccess(res, 200, response);
    } catch (error) {
      //console.log(error);
      return responseHelper.respondError(res, error);
    }
  },

  postSignUpAction: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {
      var apiData = req.body;
      const { action } = apiData;
      await DBManager.dataUpdate(
        "app_settings",
        { setting_value: action === "pause" ? "0" : "1" },
        { setting_key: "new_register_allow" }
      );

      response = {
        status: true,
        message: `Signup ${action} successfully!`,
      };

      return responseHelper.respondSuccess(res, 200, response);
    } catch (error) {
      //console.log(error);
      return responseHelper.respondError(res, error);
    }
  },

  getAllAdminsList: async function (req, res) {

    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {
      var resultAdmins = await DBManager.getData(
        "admin_master",
        "*"
      );
      var rowAdmins = resultAdmins.rows || [];
      if (rowAdmins && rowAdmins.length > 0) {
        response.data = rowAdmins;
        response.status = true;
        response.message = successMessages.ADMINS_LIST_SUCCESS;
        return responseHelper.respondSuccess(res, 200, response);
      } else {
        response.status = false;
        response.message = errorMessages.ADMINS_LIST_NOT_FOUND;
        return responseHelper.respondSuccess(res, 200, response);
      }
    } catch (error) {
      //console.log(error);
      return responseHelper.respondError(res, error);
    }

  },

  createNewAdminUser: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {

      var apiData = req.body;

      await validate.checkUserEmail(apiData);
      const { email_id } = apiData;

      const password = utils.createHex(req.body.u_password);

      var insertQry = {
        admin_name: req.body.admin_name,
        u_email_id: email_id,
        u_password: password
      };

      await DBManager.dataInsert("admin_master", insertQry);
      response.status = true;
      response.message = successMessages.ADMIN_CREATE_SUCCESS;
      return responseHelper.respondSuccess(res, 200, response);
    } catch (error) {
      return responseHelper.respondError(res, error);
    }
  },

  updateAdminUser: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };

    if (!req.query.id) {
      response.message = "Admin Id is required!";
      return responseHelper.respondSuccess(res, 404, response);
    }

    try {
      await validate.checkUserEmail({ email_id: req.body.u_email_id });
      const email_id = req.body.u_email_id;

      var updateQry = {
        admin_name: req.body.admin_name,
        u_email_id: email_id,
      };
      var whereQry = {
        admin_id: req.query.id,
      }
      await DBManager.dataUpdate("admin_master", updateQry, whereQry);
      response.status = true;
      response.message = successMessages.ADMIN_UPDATE_SUCCESS;
      return responseHelper.respondSuccess(res, 200, response);
    } catch (error) {
      return responseHelper.respondError(res, error);
    }
  },

  deleteAdminUser: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {

      await DBManager.dataDelete("admin_master", {
        admin_id: req.body.admin_id
      });

      response.status = true;
      response.message = successMessages.ADMIN_DELETE_SUCCESS;
      return responseHelper.respondSuccess(res, 200, response);

    } catch (error) {
      return responseHelper.respondError(res, error);
    }

  },

};
