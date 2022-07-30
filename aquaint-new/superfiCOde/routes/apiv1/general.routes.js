var router = require("express").Router();
const responseHelper = require("./../../common/responseHelper");
var config = require("./../../config/config");
const usersController = require("../../controllers/users.controller");

// with out auth provider list data

// router.get("/cities", usersController.listCities);

module.exports = router;
