
const Player = require('../models/playerModel');

const getAllPlayers = async () => {
    try
    {
        const players = await Player.find();
        return players;
    }
    catch (error)
    {
        throw error;
    }
};

// Function to get all the players with the role ACOLYTE
const getAllAcolytes = async () => {
    try
    {
        console.log("Getting all the players with the role ACOLYTE...");
        const players = await Player.find({role:"ACOLYTE"});
        return players;
    }
    catch (error)
    {
        throw error;
    }
};

const createPlayer = async (newPlayer) => {
    try {
        console.log("Creating new Player. Email: ", newPlayer?.email);
        
        let playerToInsert = new Player(newPlayer);
        const createdPlayer = await playerToInsert.save();

        if (!createdPlayer) {
            throw new Error("There has been an error inserting the Player in the database (/src/database/Player.js. createPlayer()"); 
        }

        console.log("Player inserted successfully");

        return createdPlayer;
    }
    catch (error)
    {
        throw error;
    }
}

const updatePlayer = async (email, newPlayer) => {

    try {
        
        // Find the player by email and update with newPlayer data
        const updatedPlayer = await Player.findOneAndUpdate(
            { email: email },     // Filter (find player with this email)
            { $set: newPlayer },  // '$use' is to merge only the specified fields in newPlayer
            { new: true }         // Return the updated document
        );

        // If no player is found, you might want to handle it
        if (!updatedPlayer) {
            throw new Error(`Player with email ${email} not found.`);
        }

        console.log(`Player with email ${email} has been updated successfuly`);

        return updatedPlayer;

    } catch (error) {
      console.error(`Error updating player with email ${email}:`, error);
      throw error;
    }
};

const findPlayerByEmail = async (email) => {

    try {
        
        console.log("Finding player by email: ", email);
        let player = await Player.find({email: email});

        // If there is no player with that email we return null
        if (player.length==0) return null
        return player;

    } catch (error) {
        console.error(`Error getting the player by email (${email}):`, error);
        throw error;
    }

};


module.exports = {
    getAllPlayers,
    getAllAcolytes,
    createPlayer,
    updatePlayer,
    findPlayerByEmail
}