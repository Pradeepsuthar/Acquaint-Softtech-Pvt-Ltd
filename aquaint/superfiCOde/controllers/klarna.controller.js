const validate = require("../validations/klarna.validation");
const responseHelper = require("./../common/responseHelper");
const DB = require("./../common/dbmanager");
const DBManager = new DB();
const _ = require("lodash");

module.exports = {
    saveCustomKlarnaInfo: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            await validate.checkKlarnaData(req.body);
            var resultBnpl = await DBManager.getData("bnpl_provider_master", "bnpl_id, bnpl_name, interest_rate, fix_amount", { bnpl_name: "klarna" });
            var rowBnpl = resultBnpl?.rows || [];
            if (rowBnpl && rowBnpl.length) {
                var insertData = {
                    _user_id: req.user.userId,
                    _bnpl_id: rowBnpl?.[0]?.bnpl_id,
                    ...req.body
                }
                await DBManager.dataInsert("user_klarna_account_master", insertData);
                response.status = true;
                response.message = 'klarna Info Saved Successfully.';
                return responseHelper.respondSuccess(res, 200, response);
            }
        }
        catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    }
};