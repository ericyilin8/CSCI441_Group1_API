const express = require("express");
const router = express();
const stateController = require("../../controller/stateController");

router
  .route("/")
  .get(stateController.getAllStates)
  .post(stateController.createNewState)
  .put(stateController.updateState)
  .delete(stateController.deleteState);

router.route("/:id").get(stateController.getState);

module.exports = router;
