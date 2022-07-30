const Joi = require("joi");
var Promise = require("promise");

const checkUserEmail = function (body) {
  const schema = Joi.object()
    .keys({
      email_id: Joi.string().email().required(),
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

const checkLogin = function (body) {
  const schema = Joi.object()
    .keys({
      email_id: Joi.string().email().required(),
      password: Joi.string().required(),
    })
    .unknown(false);
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
  checkLogin,
  checkUserEmail,
};
