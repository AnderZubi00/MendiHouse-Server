
const workoutService = require("../services/workoutService")

// -- GET -- // 

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

const getOneWorkout = async (req, res) => {

    const {params: {workoutId}} = req;

    if (!workoutId)
    {
        return res
            .status(400)
            .send({
                status: "FAILED",
                data: {error: "Parameter ':workoutId' can not be empty"}
            })
    }

    try {

        const workout = await workoutService.getOneWorkout(workoutId);
        
        if (!workout)
        {
            return res
                .status(404)
                .send({
                    status: "FAILED",
                    data: { error: `Can not find workout with the id '${workoutId}'`}
                })
        }

        res.send({status: "OK", data: workout})

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


// -- POST -- // 

const createNewWorkout = async (req, res) => {

    const {body} = req

    if (!body.name ||
        !body.mode ||
        !body.equipment
    ) {
        res
            .status(400)
            .send({
                status: "FAILED",
                data: {
                    error: "One of the following keys is missing or is empty in request body: 'name', 'mode', 'equipment'"
                }
            })

        return
    }

    const newWorkout = {
        name: body.name,
        mode: body.mode, 
        equipment: body.equipment
    }

    try {

        const createdWorkout = await workoutService.createNewWorkout(newWorkout)
        res.status(201).send({status: "OK", data: createdWorkout})

    } catch (error)
    {
        res
            .status(error?.status || 500)
            .send({status: "FAILED",
                    message: "Error al realizar la petición",
                    data: {error: error?.message || error}})
    }
}

// -- PATCH (UPDATE) -- // 

const updateOneWorkout = async (req, res) => {
    const {body, params: {workoutId}} = req

    if (!workoutId)
    {
        return res
                .status(400)
                .send({
                    status: "FAILED", 
                    data: {error: "Parameter ':workoutId' can not be empty"}    
                })
    }

    try {
        console.log(`BODY: ${body}`)
        const updatedWorkout = await workoutService.updateOneWorkout(workoutId, body)

        if (!updatedWorkout)
        {
            return res
                .status(404)
                .send({
                    status: "FAILED",
                    data: {error: `Can not find workout with the id '${workoutId}'`}
                })
        }

        res.send({status: "OK", data: updatedWorkout})
    } catch (error)
    {
        res
            .status(error?.status || 500)
            .send({
                status: "FAILED",
                message: "Error al realizar la petición",
                data: {error: error?.message || error} 
            })
    }
}


module.exports = {
    getAllWorkouts,
    getOneWorkout,
    createNewWorkout,
    updateOneWorkout
}