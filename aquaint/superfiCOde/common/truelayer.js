var config = require("./../config/config");
const axios = require("axios").default;
const DB = require("./../common/dbmanager");
const DBManager = new DB();

// Generate truelayer tokens and update in database.
const generateTruelayerToken = function (data) {
  return new Promise(async (resolve, reject) => {
    try {
      var resultData = await DBManager.getData("user_bank_account_master", "refresh_token", { _bank_id: data.body.bank_id, _user_id: data.user.userId });
      var rowData = resultData?.rows || [];
      var refreshToken = rowData?.[0]?.refresh_token || '';
      if (refreshToken && refreshToken.length) {
        const options = {
          method: 'post',
          url: `${config.TRUELAYER_SANDBOX_AUTH_BASE_URL}/connect/token`,
          headers: { Accept: 'application/json', 'Content-Type': 'application/json', },
          data: {
            grant_type: 'refresh_token',
            client_id: config.TRUELAYER_CLIENT_ID,
            client_secret: config.TRUELAYER_SECRET_KEY,
            refresh_token: refreshToken,
          }
        };
        var resultData = await axios.request(options);
        var rowData = resultData?.data || [];
        if (rowData) {
          resolve({ status: true, data: rowData });
        } else{
          resolve({ status: false, message: 'Token Not Generated.' });
        }
      } 
      else {
        resolve({ status: false, message: 'Refresh Token Not Found.' });
      }
  } catch (err) {
    resolve({ status: false, message: err?.message || 'Token Not Generated.' });
  };
});
};

module.exports = {
  generateTruelayerToken,
}
