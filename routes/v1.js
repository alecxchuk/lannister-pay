// routes for version one of the program

const { Router } = require("express");
const controller = require("../controllers/v1_controller");

module.exports = function (database) {
  const router = Router();

  // fees
  router.post("/fees", controller.fees(database));

  // compute-transaction-fee
  router.post(
    "/compute-transaction-fee",
    controller.computeTransactionFee(database)
  );

  // get db
  router.get("/all", controller.getDb(database));

  return router;
  // module.exports = router;
};
