const Artefact = require('../models/artefactModel');

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

const toggleCollectedWithArtefactId = async (artefactId, collected) => {
    try {
       
        const updatedArtefact = await Artefact.findByIdAndUpdate(
            artefactId, 
            { collected },
            { new: true, runValidators: true } 
        );

        if (!updatedArtefact) {
            throw new Error(`Artefact with ID ${artefactId} not found.`);
        }

        return updatedArtefact;
    } catch (error) {
        console.error(`Error toggling collected for artefactId ${artefactId}:`, error);
        throw error;
    }
};

const resetAllCollected = async () => {
    try {
        const result = await Artefact.updateMany({}, { collected: false });
        return result;
    } catch (error) {
        console.error("Error when resetting the collected status for all artefacts:", error);
        throw error;
    }
};

module.exports = {
    getArtefacts,
    toggleCollectedWithArtefactId,
    resetAllCollected
}