const Artefact = require('../models/artefactModel');

// // Fetch all artefacts
// const getArtefacts = async () => {
//     try {
//         const artefacts = await Artefact.find();
//         return artefacts;
//     } catch (error) {
//         console.error("Error fetching artefacts:", error);
//         throw error;
//     }
// };

// // Toggle the `collected` status of an artefact by ID
// const toggleCollectedWithArtefactId = async (artefactId, collected) => {
//     try {
//         const updatedArtefact = await Artefact.findByIdAndUpdate(
//             artefactId,
//             { collected },
//             { new: true, runValidators: true }
//         );

//         if (!updatedArtefact) {
//             throw new Error(`Artefact with ID ${artefactId} not found.`);
//         }

//         return updatedArtefact;
//     } catch (error) {
//         console.error(`Error toggling collected for artefactId ${artefactId}:`, error);
//         throw error;
//     }
// };

// Check if all four artefacts are collected
const checkAllCollected = async () => {
    try {
        const collectedArtefacts = await Artefact.find({ collected: true });

        // Check if there are exactly 4 collected artefacts
        if (collectedArtefacts.length === 4) {
            return collectedArtefacts; // Return the array of 4 artefacts
        }

        return null; // Return null if there are not exactly 4 collected artefacts
    } catch (error) {
        console.error("Error checking collected artefacts:", error);
        throw error;
    }
};
module.exports = {
    // getArtefacts,
    // toggleCollectedWithArtefactId,
    checkAllCollected,
};