
const Workout = require("../database/Workout")

const getAllWorkouts = async () => {

    try {
        const allWorkouts = Workout.getAllWorkouts();
        return allWorkouts;
        
    } catch (error)
    {
        return error
    }
}

const getOneWorkout = async (workoutId) => {
    
    try {
        const workout = Workout.getOneWorkout(workoutId);
        return workout;
        
    } catch (error)
    {
        return error
    }
}

module.exports =  {
    getAllWorkouts,
    getOneWorkout
}
