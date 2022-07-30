var config = require("./../config/config");
const validate = require("../validations/truelayer.validation");
const responseHelper = require("./../common/responseHelper");
const truelayerHelper = require("./../common/truelayer");
const DB = require("./../common/dbmanager");
const DBManager = new DB();
const axios = require("axios").default;
const { successMessages, errorMessages } = require('../common/constants');
const moment = require("moment");
const dateFormat = "YYYY-MM-DD HH:mm:ss";
const _ = require("lodash");

module.exports = {
    bankList: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            var resultBanks = await DBManager.getData(
                "bank_master",
                "bank_id, provider_id, bank_name, country, logo_url, scopes",
            );
            var rowBanks = resultBanks.rows || [];
            if (rowBanks && rowBanks.length > 0) {
                response.data = rowBanks;
                response.status = true;
                response.message = successMessages.BANK_LIST_SUCCESS;
                return responseHelper.respondSuccess(res, 200, response);
            } else {
                response.status = false;
                response.message = errorMessages.BANK_LIST_DATA_NOT_FOUND;
                return responseHelper.respondSuccess(res, 200, response);
            }
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }

    },

    // Generate truelayer auth dialog link
    generateAuthDialogLink: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            await validate.checkBankProviderId(req.query);
            response.data = {
                authLink: `${config.TRUELAYER_SANDBOX_AUTH_BASE_URL}/?response_type=code&client_id=${config.TRUELAYER_CLIENT_ID}&scope=info%20accounts%20balance%20cards%20transactions%20direct_debits%20standing_orders%20offline_access&redirect_uri=${config.TRUELAYER_REDIRECT_URI}&provider_id=${req.query.provider_id}`
            }
            response.status = true;
            response.message = successMessages.GENERATE_AUTH_LINK_SUCCESS;
            return responseHelper.respondSuccess(res, 200, response);
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    },

    authToken: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            await validate.checkBankAuthCode(req.body);
            // Exchange code to get truelayer access token and refresh token.
            const options = {
                method: 'post',
                url: `${config.TRUELAYER_SANDBOX_AUTH_BASE_URL}/connect/token`,
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', },
                data: {
                    grant_type: 'authorization_code',
                    client_id: config.TRUELAYER_CLIENT_ID,
                    client_secret: config.TRUELAYER_SECRET_KEY,
                    code: req.body.code,
                    redirect_uri: config.TRUELAYER_REDIRECT_URI,
                }
            };
            var resultData = await axios.request(options);
            var rowData = resultData?.data || [];
            if (rowData) {
                // Data about the access token and account connection.
                var resultProvider = await axios.request(
                    {
                        method: 'get',
                        url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/me`,
                        headers: { "Authorization": `Bearer ${rowData.access_token}` }
                    })
                var rowProvider = resultProvider?.data?.results || [];
                var providerId = rowProvider?.[0]?.provider?.provider_id || '';
                if (providerId && providerId.length) {
                    var resultBank = await DBManager.getData(
                        "bank_master",
                        "bank_id",
                        { provider_id: providerId }
                    );
                    var rowBank = resultBank.rows || [];
                    var bankId = rowBank?.[0]?.bank_id;
                    if (bankId) {
                        var resultUserBank = await DBManager.getData(
                            "user_bank_account_master",
                            "user_bank_account_id",
                            { _bank_id: bankId, _user_id: req.user.userId }
                        );
                        var rowUserBank = resultUserBank.rows || [];
                        var userBankAccountId = rowUserBank?.[0]?.user_bank_account_id;
                        // Check user bank account exist.
                        if (userBankAccountId) {
                            var dataObj = {
                                refresh_token: rowData.refresh_token,
                                next_refresh_token_time: moment.utc().add(29, 'd').format(dateFormat),
                                is_token_expired: 0,
                            };
                            var whereQry = {
                                _bank_id: bankId,
                                _user_id: req.user.userId,
                            }
                            await DBManager.dataUpdate("user_bank_account_master", dataObj, whereQry);
                            response.status = true;
                            response.message = successMessages.GENERATE_ACCESS_REFRESH_TOKEN;
                            return responseHelper.respondSuccess(res, 200, response);
                        } else {
                            var insertQry = {
                                _bank_id: bankId,
                                _user_id: req.user.userId,
                                refresh_token: rowData.refresh_token,
                                next_refresh_token_time: moment.utc().add(29, 'd').format(dateFormat),
                                is_token_expired: 0,
                            };
                            await DBManager.dataInsert("user_bank_account_master", insertQry);
                            response.status = true;
                            response.message = successMessages.GENERATE_ACCESS_REFRESH_TOKEN;
                            return responseHelper.respondSuccess(res, 200, response);
                        }
                    } else {
                        response.status = false;
                        response.message = errorMessages.BANK_ID_NOT_FOUND;
                        return responseHelper.respondSuccess(res, 200, response);
                    }

                } else {
                    response.status = false;
                    response.message = errorMessages.PROVIDER_ID_NOT_FOUND;
                    return responseHelper.respondSuccess(res, 200, response);
                }
            } else {
                response.status = false;
                response.message = errorMessages.TOKEN_NOT_FOUND;
                return responseHelper.respondSuccess(res, 200, response);
            }
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }

    },

    bankCards: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            await validate.checkBankId(req.body);
            var resultToken = await truelayerHelper.generateTruelayerToken(req);
            var rowToken = resultToken?.data || [];
            if (resultToken.status) {
                // List all bank cards.
                var resultCard = await axios.request(
                    {
                        method: 'get',
                        url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/cards`,
                        headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                    })
                var rowCard = resultCard?.data?.results || [];
                if (rowCard && rowCard.length) {
                    let responseData = [];
                    await Promise.all(rowCard.map(async rowCardData => {
                        var resultSavedCard = await DBManager.getData("user_card_master", "user_card_id", { _user_id: req.user.userId, _bank_id: req.body.bank_id, truelayer_card_id: rowCardData.account_id })
                        var rowSavedCard = resultSavedCard?.rows || [];
                        if (!rowSavedCard.length) {
                            // List card brand and card type data.
                            rowCardData.bank_id = req.body.bank_id;
                            var resultBrand = await DBManager.getData("card_brand_master", "card_brand_id, brand_image, brand_name", { brand_sku_code: rowCardData.provider.provider_id });
                            var rowBrand = resultBrand?.rows || [];
                            var cardBrandId = rowBrand?.[0]?.card_brand_id;
                            let responseCardType = [];
                            let responseCardData = [];
                            if (cardBrandId) {
                                var resultCardType = await DBManager.getData("card_brand_type_master", "card_type_id, card_type_name, card_type_image, interest_rate", { _card_brand_id: cardBrandId });
                                var rowCardType = resultCardType?.rows || [];
                                if (rowCardType && rowCardType.length) {
                                    await rowCardType.forEach(async rowType => {
                                        let data = {
                                            brand_id: cardBrandId,
                                            brand_name: rowBrand?.[0]?.brand_name || '',
                                            brand_image: rowBrand?.[0]?.brand_image || '',
                                            card_type_id: rowType?.card_type_id,
                                            card_type_name: rowType?.card_type_name || '',
                                            interest_rate: rowType?.interest_rate || '',
                                            card_type_image: rowType?.card_type_image || ''
                                        }
                                        responseCardType.push(data)
                                    })
                                    responseCardData = {
                                        account_id: rowCardData?.account_id,
                                        card_network: rowCardData?.card_network,
                                        card_type: rowCardData?.card_type,
                                        currency: rowCardData?.currency,
                                        ...rowCardData?.provider,
                                        card_brand_data: responseCardType
                                    }
                                }
                            }
                            responseData.push(responseCardData);
                        }
                    })).then(() => {
                        if (responseData.length) {
                            response.data = responseData;
                            response.status = true;
                            response.message = 'Card Data Listed Successfully.';
                            return responseHelper.respondSuccess(res, 200, response);
                        }
                        response.status = false;
                        response.message = 'Card Data List Not Found.';
                        return responseHelper.respondSuccess(res, 200, response);
                    })
                } else {
                    response.status = false;
                    response.message = 'Card Data Not Found.';
                    return responseHelper.respondSuccess(res, 200, response);
                }
            } else {
                response.status = false;
                response.message = 'Token Not Generated.';
                return responseHelper.respondSuccess(res, 200, response);
            }
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    },

    cardInfo: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            var resultUserCards = await DBManager.getData("user_card_master", "user_card_id, _bank_id, _card_type_id, truelayer_card_id, custom_brand_type_name, custom_interest_rate", { _user_id: req.user.userId });
            var rowUserCards = resultUserCards?.rows || [];
            if (rowUserCards && rowUserCards.length) {
                var rowBankId = await _.uniqBy(rowUserCards, '_bank_id');
                await Promise.all(rowBankId.map(async rowId => {
                    // Generate truelayer access token.
                    let data = {
                        user: { userId: req.user.userId },
                        body: { bank_id: rowId._bank_id }
                    }
                    var tokens = await truelayerHelper.generateTruelayerToken(data);
                    return { bank_id: rowId._bank_id, token: tokens };
                })).then(async (tokens) => {
                    await Promise.all(rowUserCards.map(async rowData => {
                        var resultToken = await _.find(tokens, { bank_id: rowData._bank_id });
                        resultToken = resultToken.token;
                        var rowToken = resultToken?.data || [];
                        if (resultToken.status) {
                            // List user bank card.
                            var resultCard = await axios.request(
                                {
                                    method: 'get',
                                    url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/cards/${rowData.truelayer_card_id}`,
                                    headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                                })
                            var rowCard = resultCard?.data?.results || [];
                            if (rowCard && rowCard.length) {
                                var responseData = {
                                    user_card_id: rowData.user_card_id,
                                    bank_id: rowData._bank_id,
                                    currency: rowCard[0].currency,
                                    ...rowCard[0].provider
                                };
                                // List user bank card balance.
                                var resultCardBalance = await axios.request(
                                    {
                                        method: 'get',
                                        url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/cards/${rowData.truelayer_card_id}/balance`,
                                        headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                                    })
                                var rowCardBalance = resultCardBalance?.data?.results || [];
                                if (rowCardBalance && rowCardBalance.length) {
                                    responseData.available_balance = rowCardBalance?.[0].available;
                                    responseData.current_balance = rowCardBalance?.[0].current;
                                    responseData.credit_limit = rowCardBalance?.[0].credit_limit;
                                    responseData.minimum_repayment = rowCardBalance?.[0].current == 0 ? rowCardBalance?.[0].current : rowCardBalance?.[0].current < 25 ? rowCardBalance?.[0].current : rowCardBalance?.[0].current * 0.03 < 25 ? 25 : rowCardBalance?.[0].current * 0.03;
                                }
                                if (rowData._card_type_id) {
                                    // List card brand type.
                                    var resultCardType = await DBManager.getData("card_brand_type_master", "_card_brand_id, card_type_id, card_type_name, card_type_image, interest_rate", { card_type_id: rowData._card_type_id });
                                    var rowCardType = resultCardType?.rows || [];
                                    if (rowCardType && rowCardType.length) {
                                        responseData.card_brand_id = rowCardType?.[0]?._card_brand_id,
                                            responseData.card_type_id = rowCardType?.[0]?.card_type_id,
                                            responseData.card_type_name = rowCardType?.[0]?.card_type_name || '',
                                            responseData.interest_rate = rowCardType?.[0]?.interest_rate || '',
                                            responseData.card_type_image = rowCardType?.[0]?.card_type_image || ''
                                    }
                                } else {
                                    responseData.custom_brand_type_name = rowData.custom_brand_type_name;
                                    responseData.custom_interest_rate = rowData.custom_interest_rate;
                                }
                                return responseData
                            }
                        } else {
                            response.status = false;
                            response.message = resultToken.message;
                            return responseHelper.respondSuccess(res, 200, response);
                        }
                    })).then((responseData) => {
                        response.data = responseData;
                        response.status = true;
                        response.message = 'Card Data Listed Successfully.';
                        return responseHelper.respondSuccess(res, 200, response);
                    })
                })
            } else {
                response.status = false;
                response.message = 'Users Card Not Found.';
                return responseHelper.respondSuccess(res, 200, response);
            }
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    },

    saveCardInfo: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            await validate.checkCardData(req.body);
            await Promise.all(req.body.map(async cardInfo => {
                let data = {
                    user: { userId: req.user.userId },
                    body: { bank_id: cardInfo.bank_id }
                }
                var resultTokens = await truelayerHelper.generateTruelayerToken(data);
                if (resultTokens.status) {
                    rowToken = resultTokens?.data || [];
                    var resultCardBalance = await axios.request(
                        {
                            method: 'get',
                            url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/cards/${cardInfo.account_id}/balance`,
                            headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                        })
                    var rowCardBalance = resultCardBalance?.data?.results || [];
                    if (rowCardBalance && rowCardBalance.length) {
                        cardInfo.available_balance = rowCardBalance?.[0].available;
                        cardInfo.current_balance = rowCardBalance?.[0].current;
                        cardInfo.credit_limit = rowCardBalance?.[0].credit_limit;
                        cardInfo.minimum_repayment = rowCardBalance?.[0].current == 0 ? rowCardBalance?.[0].current : rowCardBalance?.[0].current < 25 ? rowCardBalance?.[0].current : rowCardBalance?.[0].current * 0.03 < 25 ? 25 : rowCardBalance?.[0].current * 0.03;
                    }
                }
                var resultData = await DBManager.getData("user_card_master", "user_card_id", {
                    _user_id: req.user.userId,
                    _bank_id: cardInfo.bank_id,
                    truelayer_card_id: cardInfo.account_id
                })
                var rowData = resultData?.rows || [];
                var userCardId = rowData?.[0]?.user_card_id || '';
                // Check user bank card saved.
                if (userCardId) {
                    var dataObj = {
                        _card_type_id: cardInfo?.card_type_id,
                        custom_brand_type_name: cardInfo?.custom_brand_type_name || null,
                        custom_interest_rate: cardInfo?.custom_interest_rate || null,
                        card_details: JSON.stringify(cardInfo),
                    }
                    await DBManager.dataUpdate("user_card_master", dataObj, { user_card_id: userCardId });
                } else {
                    var insertData = {
                        _user_id: req.user.userId,
                        _bank_id: cardInfo.bank_id,
                        truelayer_card_id: cardInfo.account_id,
                        _card_type_id: cardInfo?.card_type_id,
                        custom_brand_type_name: cardInfo?.custom_brand_type_name || null,
                        custom_interest_rate: cardInfo?.custom_interest_rate || null,
                        card_details: JSON.stringify(cardInfo),
                    }
                    await DBManager.dataInsert("user_card_master", insertData);
                }
            })).then(() => {
                response.status = true;
                response.message = 'Card Saved Successfully.';
                return responseHelper.respondSuccess(res, 200, response);
            })
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    },

    saveAccountInfo: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            await validate.checkBankId(req.body);
            // Generate truelayer access token and refresh token.
            var resultToken = await truelayerHelper.generateTruelayerToken(req);
            var rowToken = resultToken?.data || [];
            if (resultToken.status) {
                // List users all bank accounts.
                var resultAccount = await axios.request(
                    {
                        method: 'get',
                        url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/accounts`,
                        headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                    })
                var rowAccount = resultAccount?.data?.results || [];
                if (rowAccount && rowAccount.length) {
                    await Promise.all(rowAccount.map(async rowData => {
                        var responseData = rowData || [];
                        // List users bank account balance.
                        var resultBalance = await axios.request(
                            {
                                method: 'get',
                                url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/accounts/${rowData.account_id}/balance`,
                                headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                            })
                        var rowBalance = resultBalance?.data?.results || [];
                        if (rowBalance && rowBalance.length) {
                            responseData.balance_info = rowBalance?.[0] || [];
                        }
                        var resultData = await DBManager.getData("user_overdraft_account_master", "user_overdraft_account_id", {
                            _user_id: req.user.userId,
                            _bank_id: req.body.bank_id,
                            truelayer_account_id: rowData.account_id
                        })
                        var rowData = resultData?.rows || [];
                        var userOverdraftAccountId = rowData?.[0]?.user_overdraft_account_id || '';
                        // Check user bank account saved.
                        if (userOverdraftAccountId) {
                            var dataObj = {
                                account_details: JSON.stringify(responseData),
                            }
                            await DBManager.dataUpdate("user_overdraft_account_master", dataObj, { user_overdraft_account_id: userOverdraftAccountId });
                        } else {
                            var insertData = {
                                _user_id: req.user.userId,
                                _bank_id: req.body.bank_id,
                                truelayer_account_id: responseData.account_id,
                                account_details: JSON.stringify(responseData),
                            }
                            await DBManager.dataInsert("user_overdraft_account_master", insertData);
                        }
                    })).then(() => {
                        response.status = true;
                        response.message = 'Account Saved Successfully.';
                        return responseHelper.respondSuccess(res, 200, response);
                    })
                } else {
                    response.status = false;
                    response.message = 'Users Account Not Found.';
                    return responseHelper.respondSuccess(res, 200, response);
                }
            } else {
                response.status = false;
                response.message = resultToken.message;
                return responseHelper.respondSuccess(res, 200, response);
            }
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    },

    accountInfo: async function (req, res) {
        var response = {
            status: false,
            message: "Server error! Please try again later",
        };
        try {
            // List users all bank accounts.
            var resultUserAccounts = await DBManager.runQuery(`SELECT user_overdraft_account_id, _user_id, user_overdraft_account_master._bank_id, truelayer_account_id, overdraft_catalog_master.interest_rate FROM user_overdraft_account_master LEFT JOIN overdraft_catalog_master ON user_overdraft_account_master._bank_id = overdraft_catalog_master._bank_id WHERE _user_id = '${req.user.userId}' AND user_overdraft_account_master.is_deleted = 0 AND overdraft_catalog_master.is_deleted = 0`);
            var rowUserAccounts = resultUserAccounts?.rows || [];
            if (rowUserAccounts && rowUserAccounts.length) {
                var rowBankId = await _.uniqBy(rowUserAccounts, '_bank_id');
                await Promise.all(rowBankId.map(async rowId => {
                    // Generate truelayer access token and refresh token.
                    let data = {
                        user: { userId: req.user.userId },
                        body: { bank_id: rowId._bank_id }
                    }
                    var tokens = await truelayerHelper.generateTruelayerToken(data);
                    return { bank_id: rowId._bank_id, token: tokens };
                })).then(async (tokens) => {
                    await Promise.all(rowUserAccounts.map(async rowData => {
                        var resultToken = await _.find(tokens, { bank_id: rowData._bank_id });
                        resultToken = resultToken.token;
                        var rowToken = resultToken?.data || [];
                        if (resultToken.status) {
                            // List users bank accounts.
                            var resultAccount = await axios.request(
                                {
                                    method: 'get',
                                    url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/accounts/${rowData.truelayer_account_id}`,
                                    headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                                })
                            var rowAccount = resultAccount?.data?.results || [];
                            if (rowAccount && rowAccount.length) {
                                var responseData = {
                                    user_overdraft_account_id: rowData.user_overdraft_account_id,
                                    bank_id: rowData?._bank_id,
                                    interest_rate: rowData?.interest_rate || 0,
                                    currency: rowAccount?.[0]?.currency,
                                    account_number: rowAccount?.[0]?.account_number,
                                    ...rowAccount?.[0]?.provider,
                                };
                                // List users bank accounts balance.
                                var resultBalance = await axios.request(
                                    {
                                        method: 'get',
                                        url: `${config.TRUELAYER_SANDBOX_API_BASE_URL}/data/v1/accounts/${rowData.truelayer_account_id}/balance`,
                                        headers: { "Authorization": `Bearer ${rowToken.access_token}` }
                                    })
                                var rowBalance = resultBalance?.data?.results || [];
                                if (rowBalance && rowBalance.length) {
                                    responseData.available_balance = rowBalance?.[0].available;
                                    responseData.current_balance = rowBalance?.[0].current;
                                    responseData.overdraft = rowBalance?.[0]?.overdraft || 0;
                                }
                                return responseData;
                            }
                        } else {
                            response.status = false;
                            response.message = resultToken.message;
                            return responseHelper.respondSuccess(res, 200, response);
                        }
                    })).then((responseData) => {
                        response.data = responseData;
                        response.status = true;
                        response.message = 'Account Listed Successfully.';
                        return responseHelper.respondSuccess(res, 200, response);
                    })
                })
            } else {
                response.status = false;
                response.message = 'Users Account Not Found.';
                return responseHelper.respondSuccess(res, 200, response);
            }
        } catch (error) {
            //console.log(error);
            return responseHelper.respondError(res, error);
        }
    }
};
