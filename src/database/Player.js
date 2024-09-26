
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

const createNewPlayer = async (newPlayer) => {
    try {
        let playerToInsert = new Player(newPlayer);
        const createPlayer = await playerToInsert.save();
        return createPlayer;
    }
    catch (error)
    {
        throw error;
    }
}

module.exports = {
    getAllPlayers,
    createNewPlayer
}