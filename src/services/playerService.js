const Player = require('../database/Player'); 

// Service to get all players from the database
const getAllPlayers = async () => {
    try {
        console.log("Fetching all players from the database");
        const players = await Player.getAllPlayers();
        console.log("Players fetched:", players); 
        return players;
    } catch (error) {
        console.error("Error fetching players:", error);
        throw error;
    }
};

const getRole = (playerData) => {

    let role;
    if      (playerData.email === "classcraft.daw2@aeg.eus") role = "ISTVAN";
    else if (playerData.email === "ozarate@aeg.eus")         role = "VILLAIN";
    else if (playerData.email === "oskar.calvo@aeg.eus")     role = "MORTIMER";
    else                                                     role = "ACOLYTE";
    
    console.log("Entered method getRole()");
    console.log(`Returned ${role} role`);
    
    return role;
}

const createPlayer = async (playerData) => {

    try {
        console.log("Creating new player");
        console.log("Asigning the role to the player:");

        playerData.role = getRole(playerData);
        playerData.socketId = null;
        playerData.isInside = false;

        const newPlayer = await Player.createPlayer(playerData);
        return newPlayer;

    } catch (error) {
        console.error("Error creating player:", error);
        throw error;
    }
};

const updatePlayer = async (email, playerData) => {
    try {
        console.log(`Updating player with email: ${email}`);
        const updatedPlayer = await Player.updatePlayer(email, playerData); 
        return updatedPlayer;
    } catch (error) {
        console.error("Error updating player:", error);
        throw error;
    }
};

const findPlayerByEmail = async (email) => {
    try {
        const player = await Player.findPlayerByEmail(email); 
        return player;
    } catch (error) {
        console.error("Error finding player:", error);
        throw error;
    }
};


module.exports = {
    getAllPlayers,
    createPlayer,
    updatePlayer,
    findPlayerByEmail,
};