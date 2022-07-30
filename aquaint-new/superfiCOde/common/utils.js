const jwt = require("jsonwebtoken");
const moment = require("moment");
const nodemailer = require("nodemailer");
const dateFormat = "YYYY-MM-DD HH:mm:ss";
const bucketName = process.env.BUCKET_NAME;
const REGION = process.env.AWSREGION;
const https = require("https");
var crypto = require("crypto");

var config = require("./../config/config");

const getCurrentDate = () => {
  var date = moment.utc().format(dateFormat);
  return date;
};

const getS3FileUrl = (fileName) => {
  var url = `https://${bucketName}.s3-${REGION}.amazonaws.com/${fileName}?ver=${moment.now()}`;
  return url;
};

//Create JWT
const createJWT = (parsedBody, timeExp = config.JWT_EXPIRATION) => {
  return jwt.sign(parsedBody, config.SECRET, {
    expiresIn: timeExp,
  });
};

// Create admin JWT
const createAdminJWT = (parsedBody, timeExp = config.JWT_EXPIRATION) => {
  return jwt.sign(parsedBody, config.ADMIN_SECRET, {
    expiresIn: timeExp,
  });
};

//Verify TOKEN
const verifyJWT = (token) => {
  return jwt.verify(token, config.SECRET);
};

// Verfiy ADMIN TOKEN
const verifyAdminJWT = (token) => {
  return jwt.verify(token, config.ADMIN_SECRET);
};

const verifyUser = function (authHeader) {
  return new Promise((resolve, reject) => {
    try {
      const token = authHeader && authHeader.split(" ")[1];
      if (token == null) throw Error("Invalid Token");
      let decoded = verifyJWT(token);
      let user = decoded;
      if (user && user.userId) {
        resolve(user);
      }
    } catch (err) {
      reject({ status_code: 400, message: "Unauthorized Token" });
    }
  });
};

const decodeToken = function (token) {
  return new Promise((resolve, reject) => {
    try {
      let decoded = verifyJWT(token);
      if (decoded) {
        resolve({ status: true, data: decoded });
      }
    } catch (err) {
      resolve({ status: false, message: "Unauthorized Token" });
    }
  });
};

const sendEmail = async function (to, subject, text, html) {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: true,
      auth: {
        user: config.SMTP_USERNAME,
        pass: config.SMTP_PASSWORD,
      },
    });
    transporter.sendMail(
      {
        from: `${config.SMTP_SENDER_EMAIL}`,
        to: to,
        subject: subject,
        text: text,
        html: html,
      },
      function (err, info) {
        if (err) {
          console.log("Email error: " + err.message);
          reject(err);
        } else {
          //console.log("Email sent: " + info.response);
          resolve(info);
        }
      }
    );
  });
};

const verifyAdmin = function (authHeader) {
  return new Promise((resolve, reject) => {
    try {
      const token = authHeader && authHeader.split(" ")[1];
      if (token == null) throw Error("Invalid Admin access");
      let decoded = verifyAdminJWT(token);
      let admin = decoded;
      if (admin && admin.adminId) {
        resolve(admin);
      }
    } catch (err) {
      reject({
        status_code: 400,
        message: "Unauthorized Admin access",
      });
    }
  });
};

const escapeHTML = (str) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[tag])
  );

const escapeString = function (val) {
  val = val.replace(/[\0\n\r\b\t\\'"\x1a]/g, function (s) {
    switch (s) {
      case "\0":
        return "\\0";
      case "\r":
        return "\\r";
      case "\b":
        return "\\b";
      case "\t":
        return "\\t";
      case "\x1a":
        return "\\Z";
      case "'":
        return "''";
      case '"':
        return '""';
      default:
        return "\\" + s;
    }
  });

  return val;
};

const trimObj = (obj) => {
  if (!Array.isArray(obj) && typeof obj != "object") return obj;
  return Object.keys(obj).reduce(
    function (acc, key) {
      acc[key] =
        typeof obj[key] == "string" ? obj[key].trim() : trimObj(obj[key]);
      return acc;
    },
    Array.isArray(obj) ? [] : {}
  );
};

const IsJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const fetch = async (url) => {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { timeout: 1000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299) {
        return reject(new Error(`HTTP status code ${res.statusCode}`));
      }

      const body = [];
      res.on("data", (chunk) => body.push(chunk));
      res.on("end", () => {
        const resString = Buffer.concat(body).toString();
        if (IsJsonString(resString)) {
          resolve(JSON.parse(resString));
        } else resolve(resString);
      });
    });

    request.on("error", (err) => {
      reject(err);
    });
    request.on("timeout", () => {
      request.destroy();
      reject(new Error("timed out"));
    });
  });
};

const createHex = (value) => {
  return crypto.createHmac("sha256", config.SECRET).update(value).digest("hex");
};

const generateRandomString = (length = 6) => {
  return crypto
    .randomBytes(30)
    .toString("hex")
    .substring(2, length + 2);
};

const generateRandomNumber = (length = 6) => {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  );
};

module.exports = {
  getCurrentDate,
  decodeToken,
  verifyUser,
  verifyAdmin,
  verifyJWT,
  verifyAdminJWT,
  createJWT,
  createAdminJWT,
  getS3FileUrl,
  sendEmail,
  escapeHTML,
  escapeString,
  trimObj,
  IsJsonString,
  fetch,
  createHex,
  generateRandomNumber,
  generateRandomString,
};
