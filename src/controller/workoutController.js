
const workoutService = require("../services/workoutService")

const getAllWorkouts = async (req, res) => {
    try
    {
        const allWorkouts = await workoutService.getAllWorkouts();
        if (allWorkouts.length === 0)
        {
            return res.status(404).send({message: 'No existen workouts'})
        }
        
        return res.status(200).json(allWorkouts);

    } catch (error)
    {
        res.
            status(error?.status || 500)
            .send({
                status: "FAILED",
                message: "Error al realizar la petición",
                data: {error: error?.message || error}
            })
    }
}

module.exports = {
    getAllWorkouts
}