const playerService = require("../services/playerService");

const getAllPlayers = async (req, res) => {

    try {
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

// Controler for the route to get all the players with the role ACOLYTE
const getAllAcolytes = async (req, res) => {

    try {
        const allAcolytes = await playerService.getAllAcolytes();
        if (allAcolytes.length === 0) {
            return res.status(404).send({message: "Don't exist players"});
        }
        res.send({ status: "Ok", data: allAcolytes });
    } catch (error) {
        res
            .status(error?.status || 500)
            .send( { status: "FAILED",
                message: "Error at executing the petition:",
                data: { error: error?.message || error}
            });
    }
};

const updateOrCreate = async (req, res) => {

    console.log("========= UPDATE OR CREATE PLAYER =========");
    console.log('Inserting or updating Player document in MongoDB');
    
    try {
        const playerData = req.body; // Get player data from the request body
        
        // Validating all required fields
        if (!playerData?.email ||
            !playerData?.name ||
            !playerData?.email ||
            !playerData?.level ||
            !playerData?.experience || 
            !playerData?.tasks ||
            !playerData?.gold ||
            !playerData?.attributes ||
            !playerData?.equipment ||  
            !playerData?.inventory  
        ) {
            console.log("Error inserting Player: Email field not provided");
            return res
            .status(400)
            .send({
                status: "FAILED",
                data: {
                    error: "Email field is missing or empty in the request data"
                },
            });
        }
        
        // console.log(`Received player data of user ${playerData?.email}:`, playerData);
        const playerExists = await playerService.findPlayerByEmail(playerData.email);

        // If the Player exists, we update it.
        // If the Player does not exist, we create it.
        if (playerExists) { 
            console.log("The Player already exists, updating player...");
            const updatedPlayer = await playerService.updatePlayer(playerData.email, playerData);
            return res.send({ status: "Ok", data: updatedPlayer });

        } else { 
            console.log("The Player does not exist, creating player...");
            const newPlayer = await playerService.createPlayer(playerData);
            return res.send({ status: "Ok", data: newPlayer });
        }
    } catch (error) {
        res.status(error?.status || 500).send({
            status: "FAILED",
            message: "Error at executing the petition:",
            data: { error: error?.message || error }
        });
    }
};

module.exports = {
    getAllPlayers,
    getAllAcolytes,
    updateOrCreate
};