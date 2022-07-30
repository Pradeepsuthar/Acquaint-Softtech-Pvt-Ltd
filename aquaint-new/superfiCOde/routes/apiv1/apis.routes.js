var router = require("express").Router();

var usersController = require("../../controllers/users.controller");
const auth = require("../../middleware/index");

var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${__dirname}/../../uploads`);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage });

// Auth Protected Routes

router.get(
  "/user/profile",
  [auth.verifyApiKey, auth.verifyToken],
  usersController.getUserProfile
);
router.post(
  "/user/notification-token",
  [auth.verifyApiKey, auth.verifyToken],
  usersController.savePushNotificationToken
);

module.exports = router;
