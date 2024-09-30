
const express = require("express");
const router = express.Router();

const playerController = require("../controller/playerController");

router.get("/", playerController.getAllPlayers);
router.post("/", playerController.updateOrCreate);
router.get("/acolytes", playerController.getAllAcolytes);

module.exports = router;