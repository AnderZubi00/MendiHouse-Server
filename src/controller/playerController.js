const playerService = require("../services/playerService");

const getAllPlayers = async (req, res) => {
    try{

        const allPlayers = await playerService.getAllPlayers();
        if (allPlayers.length === 0) {
            return res.status(404).send({message: "Don't exist players"});
        }
        res.send({ status: "Ok", data: allPlayers });
    } catch (error) {
        res
            .status(error?.status || 500)
            .send( { status: "FAILED",
                message: "Error at executing the petition:",
                data: { error: error?.message || error}
            });
    }
};

const createNewPlayer = async (req, res) => {
    const { body } = req;
    
    // Validating all required fields
    if (
        !body.name ||
        !body._id ||
        !body.nickname || 
        !body.email ||
        !body.avatar ||
        !body.classroom_Id ||
        !body.level ||
        !body.experience ||  // Correcting typo from 'experiene'
        !body.is_active === undefined ||  // Ensure boolean values are checked explicitly
        !body.profile ||
        !body.tasks ||
        !body.gold ||
        !body.created_date ||
        !body.socketId === null || // Check for null explicitly
        !body.isInside === undefined || // Ensure boolean values are checked explicitly
        !body.role ||
        !body.attributes ||  // Correcting typo from 'attributs'
        !body.equipment ||   // Correcting typo from 'equipmen'
        !body.inventory      // Correcting typo from 'inventor'
    ) {
        return res
            .status(400)
            .send({
                status: "FAILED",
                data: {
                    error: "One or more required fields are missing or empty in the request body"
                },
            });
    }

    // Creating a new player object
    const newPlayer = {
        _id: body._id,
        name: body.name,
        nickname: body.nickname,
        email: body.email,
        avatar: body.avatar,
        classroom_Id: body.classroom_Id,
        level: body.level,
        experience: body.experience,
        is_active: body.is_active,
        profile: body.profile,
        tasks: body.tasks,
        gold: body.gold,
        created_date: body.created_date, 
        socketId: body.socketId, 
        isInside: body.isInside, 
        role: body.role, 
        attributes: body.attributes, 
        equipment: body.equipment, 
        inventory: body.inventory 
    };

    try {
        const createdPlayer = await playerService.createNewPlayer(newPlayer);
        res.status(201).send({ status: "OK", data: createdPlayer });
    } catch (error) {
        res
            .status(error?.status || 500)
            .send({
                status: "FAILED",
                message: "Error when processing the request",
                data: { error: error?.message || error }
            });
    }
};

// const updateOrCreate = async (req, res) => {
//     try {
//         const playerData = req.body; // Get player data from the request body
//         console.log('Received player data:', playerData);

//         // Here you should implement logic to either update an existing player or create a new one
//         // For example:
//         const existingPlayer = await playerService.findPlayerByEmail(playerData.email);
//         if (existingPlayer) {
//             // Update logic here
//             const updatedPlayer = await playerService.updatePlayer(existingPlayer._id, playerData);
//             return res.send({ status: "Ok", data: updatedPlayer });
//         } else {
//             // Create new player
//             const newPlayer = await playerService.createPlayer(playerData);
//             return res.send({ status: "Ok", data: newPlayer });
//         }
//     } catch (error) {
//         res.status(error?.status || 500).send({
//             status: "FAILED",
//             message: "Error at executing the petition:",
//             data: { error: error?.message || error }
//         });
//     }
// };

module.exports = {
    getAllPlayers,
    createNewPlayer
    // updateOrCreate
};