
const Workout = require("../database/Workout")

const getAllWorkouts = async () => {
    try
    {
        const allWorkouts = Workout.getAllWorkouts();
        return allWorkouts;
        
    } catch (error)
    {
        return error
    }
}

module.exports =  {
    getAllWorkouts
}
