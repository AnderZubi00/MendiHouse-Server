const Player = require('../database/Player');

const getAllPlayers = async () => {
    try
    {
        const allPlayers = Player.getAllPlayers();
        return allPlayers;
    }
    catch (error)
    {
        throw error;
    }
};

module.exports = {
    getAllPlayers
}