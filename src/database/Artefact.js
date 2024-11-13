const Artefact = require('../models/artefactsModel');

const getArtefacts = async () => {
    try
    {
        const artefact = await Artefact.find();
        return artefact;
    }
    catch (error)
    {
        throw error;
    }
};

module.exports = {
    getArtefacts
}