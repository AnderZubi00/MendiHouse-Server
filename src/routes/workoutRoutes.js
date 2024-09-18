const express = require("express")
const router = express.Router()

const workoutController = require("../controller/workoutController")

router.get("/", workoutController.getAllWorkouts)

module.exports = router