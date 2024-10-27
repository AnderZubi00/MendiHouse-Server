const Player = require('../database/Player'); 

// Service to get all players from the database
const getAllPlayers = async () => {
    try {
        console.log("Fetching all players from the database");
        const players = await Player.getAllPlayers();
        // console.log("Players fetched:", players); 
        return players;
    } catch (error) {
        console.log("Error fetching players:", error);
        throw error;
    }
};

// Service for the route to get all the players with the role ACOLYTE
const getAllAcolytes = async () => {
    try {
        console.log("Fetching all players with the role ACOLYTE from the database");
        const players = await Player.getAllAcolytes();
        // console.log("Players fetched:", players); 
        return players;
    } catch (error) {
        console.log("Error fetching players:", error);
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
        playerData.isInsideLab = false;
        playerData.cardId = null;

        const newPlayer = await Player.createPlayer(playerData);
        return newPlayer;

    } catch (error) {
        console.log("Error creating player:", error);
        throw error;
    }
};

const updatePlayerByEmail = async (email, playerData) => {
    try {
        console.log(`Updating player with email: ${email}`);
        const updatedPlayer = await Player.updatePlayerByEmail(email, playerData); 
        return updatedPlayer;
    } catch (error) {
        console.log("Error updating player:", error);
        throw error;
    }
};

const findPlayerByEmail = async (email) => {
    try {
        const player = await Player.findPlayerByEmail(email); 
        return player;
    } catch (error) {
        console.log("Error finding player:", error);
        throw error;
    }
};


module.exports = {
    getAllPlayers,
    getAllAcolytes,
    createPlayer,
    updatePlayerByEmail,
    findPlayerByEmail,
};