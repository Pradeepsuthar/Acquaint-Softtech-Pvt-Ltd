var router = require("express").Router();
const klarnaController = require("../../controllers/klarna.controller");
const auth = require("../../middleware/index");

router.post("/save/klarna-info", auth.verifyToken, klarnaController.saveCustomKlarnaInfo);

module.exports = router;
