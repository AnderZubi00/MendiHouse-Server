
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

const updatePlayerByEmail = async (emailFilter, newPlayerData) => {

    try {
        
        // Find the player by field and update with newPlayer data
        const updatedPlayer = await Player.findOneAndUpdate(
            { email: emailFilter },     // Filter (find player with this field)
            { $set: newPlayerData },  // '$use' is to merge only the specified fields in newPlayer
            { new: true }         // Return the updated document
        );

        // If no player is found, you might want to handle it
        if (!updatedPlayer) {
            throw new Error(`Player with email ${emailFilter} not found.`);
        }

        console.log(`Player with email ${emailFilter} has been updated successfuly to ${updatedPlayer.isInsideLab}`);

        return updatedPlayer;

    } catch (error) {
      console.log(`Error updating player with field ${emailFilter}:`, error);
      throw error;
    }
};

const toggleIsInsideLabByEmail = async (emailFilter) => {
    
    try {

      const updatedPlayer = await Player.findOneAndUpdate(
        { email: emailFilter }, // Filter to find the player by email
        [
          {
            $set: {
              isInsideLab: { $not: '$isInsideLab' } // Toggle the value of isInsideLab
            }
          }
        ],
        { new: true } // Return the updated document
      );
  
      // Handle the case where the player is not found
      if (!updatedPlayer) {
        throw new Error(`Player with email ${emailFilter} not found.`);
      }
  
      console.log(`Player with email ${emailFilter} has toggled isInsideLab to ${updatedPlayer.isInsideLab}`);
  
      return updatedPlayer;
  
    } catch (error) {
      console.log(`Error toggling isInsideLab for player with email ${emailFilter}:`, error);
      throw error;
    }
};


const toggleIsInsideTowerByEmail = async (emailFilter) => {
    
    try {

      const updatedPlayer = await Player.findOneAndUpdate(
        { email: emailFilter }, // Filter to find the player by email
        [
          {
            $set: {
              isInsideTower: { $not: '$isInsideTower' } // Toggle the value of isInsideTower
            }
          }
        ],
        { new: true } // Return the updated document
      );
  
      // Handle the case where the player is not found
      if (!updatedPlayer) {
        throw new Error(`Player with email ${emailFilter} not found.`);
      }
  
      console.log(`Player with email ${emailFilter} has toggled isInsideTower successfully`);
  
      return updatedPlayer;
  
    } catch (error) {
      console.log(`Error toggling isInsideTower for player with email ${emailFilter}:`, error);
      throw error;
    }
};

  

const findPlayerByEmail = async (email) => {
    try {
        console.log("Getting data player by email: ", email);
        let player = await Player.find({email: email});

        // If there is no player with that email we return null
        if (player.length==0) return null

        return player[0];
    } catch (error) {
        console.log(`Error getting the player by email (${email}):`, error);
        throw error;
    }
};


module.exports = {
    getAllPlayers,
    getAllAcolytes,
    createPlayer,
    updatePlayerByEmail,
    findPlayerByEmail,
    toggleIsInsideLabByEmail,
    toggleIsInsideTowerByEmail
}