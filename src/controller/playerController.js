const playerService = require("../services/playerService");
const {updatePlayerByEmail} = require("../services/playerService");
const { toggleIsInsideLabByEmail } = require("../database/Player");

const getAllPlayers = async (req, res) => {

    console.log("\n========= GET ALL PLAYERS =========");

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

    console.log("\n========= GET ALL ACOLYTES =========");

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

    console.log("\n========= UPDATE OR CREATE PLAYER =========");
    console.log('Inserting or updating Player document in MongoDB');
    
    try {
        const kaotikaPlayerData = req.body; // Get player data from the request body
        
        // Validating all required fields
        if (!kaotikaPlayerData?.email) {
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
        const dbPlayerData = await playerService.findPlayerByEmail(kaotikaPlayerData.email);

        if (dbPlayerData) { 
            console.log("The Player already exists, updating player...");
          
            // Preserve isBetrayer from the existing player
            const updatedPlayerData = {
              ...kaotikaPlayerData, // Spread the incoming kaotika's player data
              attributes: dbPlayerData.attributes, // Override attributes with the value from the our database.
              isBetrayer: dbPlayerData.isBetrayer, // Override isBetrayer with the value from the our database.
            };
          
            const updatedPlayer = await playerService.updatePlayerByEmail(kaotikaPlayerData.email, updatedPlayerData);
          
            return res.send({ status: "Ok", data: updatedPlayer });
        
        } else { 
            console.log("The Player does not exist, creating player...");
            const newPlayer = await playerService.createPlayer(kaotikaPlayerData);
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


const toggleLaboratoryEntrance = async (req, res) => {

    console.log("\n========= TOGGLE LABORATORY ENTRANCE =========");
    
    try {
        const playerData = req.body; // Get player data from the request body
        const {email} = playerData;

        // Validating all required fields
        if (!email) {
            console.log("Error updating inInside: Email field not provided");
            return res
            .status(400)
            .send({
                status: "FAILED",
                data: {
                    error: "Email field is missing or empty in the request data"
                },
            });
        }
        
        // Await the asynchronous operation to ensure it completes
        const newPlayerData = await toggleIsInsideLabByEmail(email);
        
        if (newPlayerData)
        {
            console.log("In inside toggled correctly.");
            return res.send({ status: "Ok", data: newPlayerData });
        } else { 
            console.log("Error toggling inside.");
            return res.send({ status: "Ok", data: newPlayerData });
        }
    } catch (error) {
        res.status(error?.status || 500).send({
            status: "FAILED",
            message: "Error at executing the petition:",
            data: { error: error?.message || error }
        });
    }
}

const updatePlayerAttributes = async (req, res) => {
    console.log("\n========= UPDATE PLAYER ATTRIBUTES =========");
    const { email, attributes } = req.body;

    // Validation for email and attributes object
    if (!email || typeof attributes !== 'object' || attributes === null) {
        console.error("Invalid input: Email or attributes object missing/invalid");
        return res.status(400).send({
            status: "FAILED",
            data: { error: "Email and attributes object are required" },
        });
    }

    try {
        // Dynamically update player with the given attributes
        const updatedPlayer = await updatePlayerByEmail(email, attributes);

        if (!updatedPlayer) {
            console.error("Player not found for given email:", email);
            return res.status(404).send({ status: "FAILED", data: { error: "Player not found" } });
        }

        console.log("Update succesful of the attributes for the player:", Object.keys(attributes));
        return res.status(200).send({ status: "OK", data: updatedPlayer });
    } catch (error) {
        console.error("Error updating player attributes:", error);
        return res.status(500).send({
            status: "FAILED",
            data: { error: "An error occurred while updating player attributes" },
        });
    }
};



module.exports = {
    getAllPlayers,
    getAllAcolytes,
    updateOrCreate,
    toggleLaboratoryEntrance,
    updatePlayerAttributes
};