exports.respondWithCodeOnly = function (res, code) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(code);
};

exports.respondError = function (res, error) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  var message = error.message ? error.message : "Server error!";
  var code = error.status_code && error.status_code == 400 ? 400 : 500;
  var body = { status: false, message };
  return res.status(code).json(body);
};

exports.respondSuccess = function (res, code, body) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(code).json(body);
};
