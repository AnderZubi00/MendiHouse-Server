
const Workout = require("../models/workoutModel")

// -- GET -- // 

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

// -- POST -- // 

const createNewWorkout = async (newWorkout) => {

    try
    {
        let workoutToInsert = new Workout(newWorkout)
        const createdWorkout = await workoutToInsert.save()
        return createdWorkout;

    } catch (error)
    {
        throw error
    }

}

// -- PATCH (UPDATE) -- // 

const updateOneWorkout = async (workoutId, changes) => {
    try {
        let updatedWorkout = await Workout.findByIdAndUpdate(workoutId, {$set: changes}, {new: true})
        return updatedWorkout
    } catch (error)
    {
        throw error
    }
}

// -- DELETE -- //

const deleteOneWorkout = async (workoutId) => {
    try {
        let deletedWorkout = Workout.findByIdAndDelete(workoutId)
        return deletedWorkout
    } catch (error)
    {
        throw error
    }
}


module.exports = {
    getAllWorkouts,
    getOneWorkout,
    createNewWorkout,
    updateOneWorkout,
    deleteOneWorkout
}
