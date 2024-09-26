const Player = require('../database/Player'); // Import your Player model

// Service to get all players from the database
const getAllPlayers = async () => {
    try {
        console.log("Fetching all players from the database");
        const players = await Player.getAllPlayers(); // Assuming this returns a promise
        console.log("Players fetched:", players); 
        return players;
    } catch (error) {
        console.error("Error fetching players:", error);
        throw error;
    }
};

const createNewPlayer = async (newPlayer) => {
    try{
        const createdPlayer = Player.createNewPlayer(newPlayer);
        return createdPlayer;
    }
    catch (error)
    {
        throw error;
    }
};

// // Service to find a player by email
// const findPlayerByEmail = async (email) => {
//     try {
//         console.log(`Finding player by email: ${email}`);
//         const player = await Player.findPlayerByEmail(email); // Assuming this method exists
//         return player;
//     } catch (error) {
//         console.error("Error finding player:", error);
//         throw error;
//     }
// };

// // Service to create a new player
// const createPlayer = async (playerData) => {
//     try {
//         console.log("Creating new player:", playerData);
//         const newPlayer = await Player.createPlayer(playerData); // Assuming this method exists
//         return newPlayer;
//     } catch (error) {
//         console.error("Error creating player:", error);
//         throw error;
//     }
// };

// // Service to update an existing player
// const updatePlayer = async (id, playerData) => {
//     try {
//         console.log(`Updating player with ID: ${id}`, playerData);
//         const updatedPlayer = await Player.updatePlayer(id, playerData); // Assuming this method exists
//         return updatedPlayer;
//     } catch (error) {
//         console.error("Error updating player:", error);
//         throw error;
//     }
// };

// // Main method to update or create a player
// const updateOrCreate = async (playerData) => {
//     try {
//         console.log("Updating/Creating player in the database");
        
//         const existingPlayer = await findPlayerByEmail(playerData.email);
        
//         if (existingPlayer) {
//             // Update the existing player
//             const updatedPlayer = await updatePlayer(existingPlayer._id, playerData);
//             console.log("Player updated:", updatedPlayer);
//             return updatedPlayer;
//         } else {
//             // Create a new player
//             const newPlayer = await createPlayer(playerData);
//             console.log("New player created:", newPlayer);
//             return newPlayer;
//         }
//     } catch (error) {
//         console.error("Error updating/creating player:", error);
//         throw error;
//     }
// };

module.exports = {
    getAllPlayers,
    createNewPlayer
    // updateOrCreate,
    // findPlayerByEmail, // Exporting the find method
    // createPlayer,
    // updatePlayer
};