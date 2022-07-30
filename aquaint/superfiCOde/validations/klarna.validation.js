const Joi = require("joi");
var Promise = require("promise");

const checkKlarnaData = function (body) {
    const schema = Joi.object()
      .keys({
        klarna_account_id: Joi.number().optional(),
        price_of_purchase: Joi.number().required(),
        remaining_balance: Joi.number().required(),
        interest_free_period: Joi.number().required(),
        payment_schedule: Joi.string().required(),
        repayment_plan_left_months:  Joi.number().required(),
    })
      .unknown(true);
    return new Promise((resolve, reject) => {
      const { value, error, warning } = schema.validate(body);
      if (error) {
        reject({ status_code: 400, message: error.details[0].message });
      } else {
        resolve(value);
      }
    });
}

module.exports = {
    checkKlarnaData,
};
