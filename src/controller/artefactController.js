const Artefact = require('../models/artefactModel');

const getArtefacts = async (req, res) => {
    console.log("\n========= GET Artefacts =========");

    try {
        const allArtefacts = await Artefact.find();
        if (allArtefacts.length === 0) {
            return res.status(404).send({ status: "FAILED", message: "No existen artefactos" });
        }
        console.log("Artefacts recieved!");     
        res.send({ status: "OK", data: allArtefacts });
    } catch (error) {
        console.error("Error al obtener artefactos:", error);
        res.status(500).send({
            status: "FAILED",
            message: "Error al ejecutar la petición",
            data: { error: error.message || error }
        });
    }
};

module.exports = {
    getArtefacts
}