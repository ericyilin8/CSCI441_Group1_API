const express = require("express");
const router = express();
const stateController = require("../../controller/stateController");

router
  .route("/")
    .get(stateController.getAllStates)
    .post(stateController.createNewState)
    .put(stateController.updateState)
    .delete(stateController.deleteState);

router
  .route("/:id")
    .get(stateController.getState)
router
  .route("/:id/admission")
    .get(stateController.getStateAdmission)
router
  .route("/:id/capital")
    .get(stateController.getStateCapital)
router
  .route("/:id/nickname")
    .get(stateController.getStateNickname)
router
  .route("/:id/population")
    .get(stateController.getStatePopulation)
router
  .route("/:id/funfact")
  .get(stateController.getStateFunFact)


module.exports = router;
