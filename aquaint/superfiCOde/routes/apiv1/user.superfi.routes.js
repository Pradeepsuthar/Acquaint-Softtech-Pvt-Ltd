var router = require("express").Router();
const userSuperfiController = require("../../controllers/user.superfi.controller");
const auth = require("../../middleware/index");

router.post("/calculation-method", auth.verifyToken, userSuperfiController.calculationMethod);
router.get("/debt/calculation-info", auth.verifyToken, userSuperfiController.debtCalculationInfo);
router.get("/dashboard-info", auth.verifyToken, userSuperfiController.dashboardInfo);

module.exports = router;
