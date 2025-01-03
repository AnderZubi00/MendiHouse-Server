
const express = require("express");
const router = express.Router();

const playerController = require("../controller/playerController");

router.get("/", playerController.getAllPlayers);
router.post("/", playerController.updateOrCreate);
router.patch("/", playerController.updateOrCreate);
router.get("/acolytes", playerController.getAllAcolytes);
router.post("/toggleLaboratoryEntrance", playerController.toggleLaboratoryEntrance);
router.post("/attributes", playerController.updatePlayerAttributes);
router.post("/sickenPlayer", playerController.sickenPlayer)


module.exports = router;