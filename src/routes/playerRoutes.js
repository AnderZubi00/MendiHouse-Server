
const express = require("express");
const router = express.Router();

const playerController = require("../controller/playerController");

router.get("/", playerController.getAllPlayers);
router.post("/", playerController.updateOrCreate);

module.exports = router;