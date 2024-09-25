const Player = require('../database/Player');

const getAllPlayers = async () => {
    try
    {
        console.log("Fetching all players from the database");
        const players = Player.getAllPlayers();
        console.log("Players fetched:", players); 
        return players;
    }
    catch (error)
    {
        throw error;
    }
};

module.exports = {
    getAllPlayers
}