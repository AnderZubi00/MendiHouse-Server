
const express = require("express");
const router = express.Router();

const playerController = require("../controller/playerController");

router.get("/", playerController.getAllPlayers);
router.post("/", playerController.updateOrCreate);
router.patch("/", playerController.updateOrCreate);
router.get("/acolytes", playerController.getAllAcolytes); // Route to get all the players with the role ACOLYTE
router.post("/toggleLaboratoryEntrance", playerController.toggleLaboratoryEntrance);


module.exports = router;