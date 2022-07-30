const Joi = require("joi");
var Promise = require("promise");

const checkCalculationData = function (body, query) {
    const schema = Joi.object()
        .keys({
            pay_amount: query?.method_type == 'avalanche' || query?.method_type == 'snowball' ? Joi.number().required() : Joi.optional(),
            cards_accounts: Joi.array()
                .items(Joi.object()
                .keys({
                    user_card_id: Joi.number().optional(),
                    user_overdraft_account_id: Joi.number().optional(),
                    klarna_id: Joi.number().optional(),
                    bank_id: Joi.number().when('user_card_id', { is: Joi.exist(), then: Joi.number().required()}).concat(Joi.number().when('user_overdraft_account_id', { is: Joi.exist(), then: Joi.number().required()})),
                    card_type_id: Joi.number().optional(),
                    display_name: Joi.string().required(),
                    provider_id: Joi.string().optional(),
                    logo_uri: Joi.string().optional(),
                    interest_rate: Joi.required(),
                    current_balance: Joi.number().required(),
                    minimum_repayment: Joi.number().optional()
                })
                .or('user_card_id', 'user_overdraft_account_id', 'klarna_id')
                .required()
                )
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
};

module.exports = {
    checkCalculationData,
};
