
const Workout = require("../models/workoutModel")

const getAllWorkouts = async () => {
    try {
        const workouts = await Workout.find()
        return workouts
    } catch (error)
    {
        throw error
    }
}

const getOneWorkout = async (workoutId) => {
    try {
        const workout = await Workout.findById(workoutId)
        return workout
    } catch (error)
    {
        throw error
    }
}

module.exports = {
    getAllWorkouts,
    getOneWorkout
}
