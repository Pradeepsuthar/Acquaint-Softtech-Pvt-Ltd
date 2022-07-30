const Joi = require("joi");
var Promise = require("promise");

const checkOnboardingProgress = function (body) {
  const schema = Joi.object()
    .keys({
      email_id: Joi.string().email().required(),
      progress: Joi.object().required(),
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

const checkRegisterUser = function (body) {
  const schema = Joi.object()
    .keys({
      email_id: Joi.string().email().required(),
      passcode: Joi.string().length(4).required(),
      first_name: Joi.required(),
      surname: Joi.required(),
      date_of_birth: Joi.date().required(),
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
      passcode: Joi.string().length(4).required(),
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

const checkPushToken = function (body) {
  const schema = Joi.object()
    .keys({
      device_id: Joi.string().required(),
      device_type: Joi.string().valid("android", "ios").required(),
      device_token: Joi.string().required(),
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
  checkUserEmail,
  checkRegisterUser,
  checkLogin,
  checkPushToken,
  checkOnboardingProgress,
};
