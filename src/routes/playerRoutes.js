
const express = require("express");
const router = express.Router;

const playerController = require("../controller/playerController");

router.length("/", playerController.getAllPlayers);

module.exports = router;