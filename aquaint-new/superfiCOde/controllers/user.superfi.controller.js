const validate = require("../validations/user.superfi.validation");
const superfiHelper = require("./../common/superfi");
const responseHelper = require("./../common/responseHelper");
const DB = require("./../common/dbmanager");
const DBManager = new DB();
const _ = require("lodash");

module.exports = {
    calculationMethod: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            await validate.checkCalculationData(req.body, req.query);
            // Nonsuperfi method calculation
            var resultNonSuperfi = await superfiHelper.nonSuperfiCalculation(req.body.cards_accounts);
            // Avalanche method calculation
            if (req.query.method_type == 'avalanche') {
                var resultAvalanche = await superfiHelper.avalancheCalculation(req.body.pay_amount, req.body.cards_accounts);
                response.message = resultAvalanche?.message || 'Avalanche Calculation Successfully.';
                response.status = resultAvalanche.status;
                response.data = {nonsuperfi: resultNonSuperfi.data, avalanche: resultAvalanche.data};
            }
            // Snowball method calculation
            if (req.query.method_type == 'snowball') {
                var resultSnowball = await superfiHelper.snowballCalculation(req.body.pay_amount, req.body.cards_accounts);
                response.message = resultSnowball?.message || 'Snowball Calculation Successfully.';
                response.status = resultSnowball.status;
                response.data = {nonsuperfi: resultNonSuperfi.data, snowball: resultSnowball.data};
            }
            if (!req.query.method_type || req.query.method_type == 'nonsuperfi') {
                response.message = resultNonSuperfi?.message || 'Non Superfi Calculation Successfully.';
                response.status = resultNonSuperfi.status;
                response.data = resultNonSuperfi.data;
            }
            if (response.status) {
                var resultData = await DBManager.getData("superfi_user_debt_record_master", "superfi_debt_calculation_id, method_type", { _user_id: req.user.userId });
                var rowData = resultData?.rows || [];
                var resultSuperfiCalculation = await _.find(rowData, { method_type: req?.query?.method_type || 'nonsuperfi' });
                superfiDebtCalculationId = resultSuperfiCalculation?.superfi_debt_calculation_id;
                if (superfiDebtCalculationId) {
                    var dataObj = {
                        superfi_debt_calculation_details: JSON.stringify(response.data)
                    };
                    await DBManager.dataUpdate("superfi_user_debt_record_master", dataObj, { superfi_debt_calculation_id: superfiDebtCalculationId });
                }
                else {
                    var insertData = {
                        _user_id: req.user.userId,
                        method_type: req?.query?.method_type || 'nonsuperfi',
                        superfi_debt_calculation_details: JSON.stringify(response.data)
                    }
                    await DBManager.dataInsert("superfi_user_debt_record_master", insertData);
                }

            }
            return responseHelper.respondSuccess(res, 200, response);
        }
        catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    },

    debtCalculationInfo: async function(req, res){
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            var resultDebtCalculation = await DBManager.getData("superfi_user_debt_record_master", "superfi_debt_calculation_id, method_type, superfi_debt_calculation_details");
            var rowDebtCalculation = resultDebtCalculation?.rows || [];
            if(rowDebtCalculation && rowDebtCalculation.length){
                response.data = rowDebtCalculation;
                response.status = true;
                response.message = 'Debt Calculation Data Listed Successfully.';
                return responseHelper.respondSuccess(res, 200, response);
            }
            else{
                response.status = false;
                response.message = 'Debt Calculation Data Not Found.';
                return responseHelper.respondSuccess(res, 200, response);
            }
        }
        catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    },

    dashboardInfo: async function(req, res){
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            var responseData = {};
            // Cards info.
            var resultUserCards = await DBManager.runQuery(`SELECT user_card_master.*, card_type_id, card_brand_id, brand_name, brand_image, card_type_name, interest_rate, card_type_image FROM user_card_master
                                                        LEFT JOIN card_brand_type_master on user_card_master."_card_type_id" = card_brand_type_master.card_type_id AND card_brand_type_master.is_deleted = user_card_master.is_deleted
                                                        LEFT JOIN card_brand_master ON card_brand_type_master._card_brand_id = card_brand_master.card_brand_id and card_brand_master.is_deleted = card_brand_type_master.is_deleted
                                                        WHERE _user_id = '${req.user.userId}' AND user_card_master.is_deleted = 0`);
            var rowUserCards = resultUserCards?.rows || [];
            if(rowUserCards && rowUserCards.length){
                await Promise.all(rowUserCards.map(async userCard => {
                    let responseUserCard = {
                        user_card_id: userCard.user_card_id,
                        bank_id: userCard._bank_id,
                        display_name: userCard?.card_details?.provider?.display_name || '',
                        provider_id: userCard?.card_details?.provider?.provider_id || '',
                        logo_uri: userCard?.card_details?.provider?.logo_uri || '',
                        available_balance: userCard?.card_details?.available_balance || '',
                        current_balance: userCard?.card_details?.current_balance || '',
                        credit_limit: userCard?.card_details?.credit_limit || '',
                        minimum_repayment: userCard?.card_details?.minimum_repayment || '',
                        card_brand_id: userCard?.card_brand_id || '',
                        card_type_id: userCard?.card_type_id || '',
                        card_type_name: userCard?.card_type_name || '',
                        interest_rate: userCard?.interest_rate || '',
                        card_type_image: userCard?.card_type_image || '',
                        custom_brand_type_name: userCard?.custom_brand_type_name || '',
                        custom_interest_rate: userCard?.custom_interest_rate || ''
                    }
                    return responseUserCard;
                })).then((responseUserCard) => {
                    responseData.card_details = responseUserCard;
                })
            }
            // Accounts info.
            var resultUserAccounts = await DBManager.runQuery(`SELECT user_overdraft_account_id, _user_id, user_overdraft_account_master._bank_id, truelayer_account_id, account_details, overdraft_catalog_master.interest_rate FROM user_overdraft_account_master LEFT JOIN overdraft_catalog_master ON user_overdraft_account_master._bank_id = overdraft_catalog_master._bank_id WHERE _user_id = '${req.user.userId}' AND user_overdraft_account_master.is_deleted = 0 AND overdraft_catalog_master.is_deleted = 0`);
            var rowUserAccounts = resultUserAccounts?.rows || [];
            if (rowUserAccounts && rowUserAccounts.length) {
                await Promise.all(rowUserAccounts.map(async userAccount => {
                    let responseUserAccount = {
                        user_overdraft_account_id: userAccount?.user_overdraft_account_id,
                        bank_id: userAccount?._bank_id,
                        interest_rate: userAccount?.interest_rate || '',
                        currency: userAccount?.account_details?.currency || '',
                        account_number: userAccount?.account_details?.account_number || {},
                        available_balance: userAccount?.account_details?.balance_info?.available || '',
                        current_balance: userAccount?.account_details?.balance_info?.current || '',
                        overdraft: userAccount?.account_details?.balance_info?.overdraft || 0,
                        ...userAccount?.account_details?.provider
                    }
                    return responseUserAccount;
                })).then((responseUserAccount) => {
                    responseData.overdraft_account_details = responseUserAccount;
                })
            }
            // Klarna account info.
            var resultKlarnaAccounts = await DBManager.runQuery(`SELECT klarna_id, bnpl_id, bnpl_name, interest_rate, fix_amount, klarna_account_id, price_of_purchase, remaining_balance, interest_free_period, payment_schedule, repayment_plan_left_months FROM user_klarna_account_master LEFT JOIN bnpl_provider_master ON user_klarna_account_master._bnpl_id = bnpl_provider_master.bnpl_id AND user_klarna_account_master.is_deleted = bnpl_provider_master.is_deleted WHERE _user_id = '${req.user.userId}' AND user_klarna_account_master.is_deleted = 0`);
            var rowklarnaAccounts = resultKlarnaAccounts?.rows || [];
            if (rowklarnaAccounts && rowklarnaAccounts.length) {
                responseData.klarna_accounts = rowklarnaAccounts;
            }
            response.data = responseData;
            response.status = true;
            response.message = 'Dashboard Info Listed Successfully.';
            return responseHelper.respondSuccess(res, 200, response);
        }
        catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    }
};