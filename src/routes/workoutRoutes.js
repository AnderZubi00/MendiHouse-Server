const express = require("express")
const router = express.Router()

const workoutController = require("../controller/workoutController")

// -- GET -- // 
router.get("/", workoutController.getAllWorkouts)
router.get("/:workoutId", workoutController.getOneWorkout)

// -- POST -- // 
router.post("/", workoutController.createNewWorkout)

// -- PATCH (UPDATE) -- // 
router.patch("/:workoutId", workoutController.updateOneWorkout)


module.exports = router