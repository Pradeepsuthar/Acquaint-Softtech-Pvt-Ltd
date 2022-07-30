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

module.exports = {
  getAllUsers: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {
      var sqlQry = `SELECT * FROM users_master WHERE is_deleted = 0 ORDER BY date_created DESC`;
      var results = await DBManager.runQuery(sqlQry);
      var rows = results?.rows || [];

      response = {
        status: true,
        message: "Success",
        data: rows,
      };

      return responseHelper.respondSuccess(res, 200, response);
    } catch (error) {
      //console.log(error);
      return responseHelper.respondError(res, error);
    }
  },

  viewUserDetails: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {
      const { userId } = req.params;
      var userInfo = {};

      var result = await DBManager.getData("users_master", "*", {
        user_id: userId,
      });
      var userData = result?.rows?.[0] || {};
      userInfo["info"] = userData;

      var result = await DBManager.getData(
        "user_onboarding_progress_master",
        "*",
        {
          email_id: userData["u_email_id"],
        }
      );
      var userOnboard = result?.rows?.[0] || {};
      userInfo["onboarding"] = userOnboard;

      /************************************* Credit Cards *******************************/

      var result = await DBManager.getData("user_card_master", "*", {
        _user_id: userId,
      });
      var userCardInfo = result?.rows || [];
      userInfo["credit_cards"] = userCardInfo;

      /************************************* Overdraft Accounts *******************************/

      var result = await DBManager.getData(
        "user_overdraft_account_master",
        "*",
        {
          _user_id: userId,
        }
      );
      var userOverdraftAccountInfo = result?.rows || [];
      userInfo["overdraft_account"] = userOverdraftAccountInfo;

      /************************************* Klarna Accounts *******************************/

      var result = await DBManager.getData("user_klarna_account_master", "*", {
        _user_id: userId,
      });
      var userKlarnaAccountInfo = result?.rows || [];
      userInfo["klarna_account"] = userKlarnaAccountInfo;

      response = {
        status: true,
        message: "Success",
        data: userInfo,
      };

      return responseHelper.respondSuccess(res, 200, response);
    } catch (error) {
      //console.log(error);
      return responseHelper.respondError(res, error);
    }
  },

  userAction: async function (req, res) {
    var response = {
      status: false,
      message: "Server error! Please try again later",
    };
    try {
      const { action } = req.body;
      const { userId } = req.params;

      if (!action || !userId) {
        response.message = "Invalid request";
        return responseHelper.respondSuccess(res, 200, response);
      }

      if (action == "delete") {
        var resultUser = await DBManager.getData("users_master", "*", {
          user_id: userId,
        });
        var rowUser = resultUser?.rows?.[0] || {};

        var sqlDeleteQry = `UPDATE users_master SET is_deleted = '1', status = 'delete' WHERE user_id = '${userId}'`;
        await DBManager.runQuery(sqlDeleteQry);

        if (rowUser && rowUser.u_email_id) {
          var userEmailId = rowUser.u_email_id;
          var sqlDeleteRecordQry = `DELETE FROM user_onboarding_progress_master WHERE email_id = '${userEmailId}'`;
          await DBManager.runQuery(sqlDeleteRecordQry);
        }

        response = {
          status: true,
          message: "User deleted successfully!",
        };
        return responseHelper.respondSuccess(res, 200, response);
      } else if (action == "Activate") {
        var sqlQry = `UPDATE users_master SET status = 'active' WHERE user_id = '${userId}'`;
        await DBManager.runQuery(sqlQry);

        response = {
          status: true,
          message: "User activated successfully!",
        };
        return responseHelper.respondSuccess(res, 200, response);
      } else if (action == "Pause") {
        var sqlQry = `UPDATE users_master SET status = 'pause' WHERE user_id = '${userId}'`;
        await DBManager.runQuery(sqlQry);

        response = {
          status: true,
          message: "User pause successfully!",
        };
        return responseHelper.respondSuccess(res, 200, response);
      }

      return responseHelper.respondSuccess(res, 200, response);
    } catch (error) {
      //console.log(error);
      return responseHelper.respondError(res, error);
    }
  },
};
