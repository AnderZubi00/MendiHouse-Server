
const express = require("express");
const router = express.Router();

const playerController = require("../controller/playerController");

router.get("/", playerController.getAllPlayers);
router.post("/", playerController.updateOrCreate);
// Route to get all the players with the role ACOLYTE
router.get("/acolytes", playerController.getAllAcolytes);

module.exports = router;