const express = require("express");
const router = express.Router();

const artefactController = require("../controller/artefactController");

router.get("/", artefactController.getArtefacts);

module.exports = router;