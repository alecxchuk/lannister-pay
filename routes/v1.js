// routes for version one of the program

const { Router } = require("express");
const controller = require("../controllers/v1_controller");

const router = Router();

// fees
router.post("/fees", controller.fees);

// compute-transaction-fee
router.post("/compute-transaction-fee", controller.computeTransactionFee);

// get db
router.get("/all", controller.getDb);

module.exports = router;
