const playerService = require("../services/playerService");

const getAllPlayers = async (req, res) => {
    try{

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

module.exports = {
    getAllPlayers
};