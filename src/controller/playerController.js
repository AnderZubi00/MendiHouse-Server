const playerService = require("../services/playerService");
const { updatePlayerByEmail, restPlayer } = require("../services/playerService");
const { toggleIsInsideLabByEmail, findPlayerByEmail, applyDiseasePenalty, applyHealingReward,  } = require("../database/Player");
const ValidationError = require('../utils/errors');

const getAllPlayers = async (req, res) => {

  console.log("\n========= GET ALL PLAYERS =========");

  try {
    const allPlayers = await playerService.getAllPlayers();
    if (allPlayers.length === 0) {
      return res.status(404).send({ message: "Don't exist players" });
    }
    res.send({ status: "Ok", data: allPlayers });
  } catch (error) {
    res
      .status(error?.status || 500)
      .send({
        status: "FAILED",
        message: "Error at executing the petition:",
        data: { error: error?.message || error }
      });
  }
};

// Controler for the route to get all the players with the role ACOLYTE
const getAllAcolytes = async (req, res) => {

  console.log("\n========= GET ALL ACOLYTES =========");

  try {
    const allAcolytes = await playerService.getAllAcolytes();
    if (allAcolytes.length === 0) {
      return res.status(404).send({ message: "Don't exist players" });
    }
    res.send({ status: "Ok", data: allAcolytes });
  } catch (error) {
    res
      .status(error?.status || 500)
      .send({
        status: "FAILED",
        message: "Error at executing the petition:",
        data: { error: error?.message || error }
      });
  }
};

const updateOrCreate = async (req, res) => {

  console.log("\n========= UPDATE OR CREATE PLAYER =========");
  console.log('Inserting or updating Player document in MongoDB');

  try {
    const kaotikaPlayerData = req.body; // Get player data from the request body

    // Validating all required fields
    if (!kaotikaPlayerData?.email) {
      console.log("Error inserting Player: Email field not provided");
      return res
        .status(400)
        .send({
          status: "FAILED",
          data: {
            error: "Email field is missing or empty in the request data"
          },
        });
    }

    // console.log(`Received player data of user ${playerData?.email}:`, playerData);
    const dbPlayerData = await playerService.findPlayerByEmail(kaotikaPlayerData.email);

    if (dbPlayerData) {
      console.log("The Player already exists, updating player...");

      // Preserve isBetrayer from the existing player
      const updatedPlayerData = {
        ...kaotikaPlayerData, // Spread the incoming kaotika's player data
        inventory: dbPlayerData.inventory,// Override attributes with the value from the our database.
        attributes: dbPlayerData.attributes, // Override attributes with the value from the our database.
        //isBetrayer: dbPlayerData.isBetrayer, // Override isBetrayer with the value from the our database.
      };

      const updatedPlayer = await playerService.updatePlayerByEmail(kaotikaPlayerData.email, updatedPlayerData);

      return res.send({ status: "Ok", data: updatedPlayer });

    } else {
      console.log("The Player does not exist, creating player...");
      const newPlayer = await playerService.createPlayer(kaotikaPlayerData);
      return res.send({ status: "Ok", data: newPlayer });
    }
  } catch (error) {
    res.status(error?.status || 500).send({
      status: "FAILED",
      message: "Error at executing the petition:",
      data: { error: error?.message || error }
    });
  }
};


const toggleLaboratoryEntrance = async (req, res) => {

  console.log("\n========= TOGGLE LABORATORY ENTRANCE =========");

  try {
    const playerData = req.body; // Get player data from the request body
    const { email } = playerData;

    // Validating all required fields
    if (!email) {
      console.log("Error updating inInside: Email field not provided");
      return res
        .status(400)
        .send({
          status: "FAILED",
          data: {
            error: "Email field is missing or empty in the request data"
          },
        });
    }

    // Await the asynchronous operation to ensure it completes
    const newPlayerData = await toggleIsInsideLabByEmail(email);

    if (newPlayerData) {
      console.log("In inside toggled correctly.");
      return res.send({ status: "Ok", data: newPlayerData });
    } else {
      console.log("Error toggling inside.");
      return res.send({ status: "Ok", data: newPlayerData });
    }
  } catch (error) {
    res.status(error?.status || 500).send({
      status: "FAILED",
      message: "Error at executing the petition:",
      data: { error: error?.message || error }
    });
  }
}

const updatePlayerAttributes = async (req, res) => {
  console.log("\n========= UPDATE PLAYER ATTRIBUTES =========");
  const { email, attributes } = req.body;

  // Validation for email and attributes object
  if (!email || typeof attributes !== 'object' || attributes === null) {
    console.error("Invalid input: Email or attributes object missing/invalid");
    return res.status(400).send({
      status: "FAILED",
      data: { error: "Email and attributes object are required" },
    });
  }

  try {
    // Dynamically update player with the given attributes
    const updatedPlayer = await updatePlayerByEmail(email, attributes);

    if (!updatedPlayer) {
      console.error("Player not found for given email:", email);
      return res.status(404).send({ status: "FAILED", data: { error: "Player not found" } });
    }

    console.log("Update succesful of the attributes for the player:", Object.keys(attributes));
    return res.status(200).send({ status: "OK", data: updatedPlayer });
  } catch (error) {
    console.error("Error updating player attributes:", error);
    return res.status(500).send({
      status: "FAILED",
      data: { error: "An error occurred while updating player attributes" },
    });
  }
};


const sickenPlayer = async (req, res) => {

  console.log("\n========= SICKENING PLAYER =========");

  try {
    const { email, disease } = req.body;

    // Validate data  
    if (!email) {throw new Error("Email not provided")}
    if (!disease) {throw new Error("Disease not provided")}
    if (!disease?.modifiers || typeof disease?.modifiers !== 'object') {throw new Error("Disease does not have an expected structure.")}

    // Get player data
    const acolyte = await findPlayerByEmail(email);
    if (acolyte === null) {throw new Error(`Could not find acolyte with email ${email}.`)}

    // Check if player already suffers the disease
    if (acolyte.diseases.includes(disease.name)) {throw new ValidationError(`Acolyte already suffers ${disease.name}.`)}

    // Validate if is acolyte and is loyal
    if (acolyte.isBetrayer) {throw new ValidationError("The selected acolyte is a betrayer. It can not be sicken.")}

    // Apply penalties 
    const newAttributes = applyDiseasePenalty(acolyte.attributes, disease.modifiers);

    // Push disease name to diseases array
    const newDiseases = [...acolyte.diseases, disease.name];

    // Update the changes in the database.
    acolyte.diseases = newDiseases;

    acolyte.attributes = newAttributes;
    acolyte.markModified('attributes'); // Tells Mongoose the 'attributes' object changed so it will save those updates.
  
    // Make the change in the database.
    await acolyte.save(); 
     
    // Return the new player data.
    return res.status(200).send({ status: "OK", playerData: acolyte });

  } catch (error) {
    console.log("Error sickening player: ", error.message); 
    const errorMessage = error.name === 'ValidationError' ? error.message : `Internal Error: ${error.message}`;  
    console.log(errorMessage);
    return res.status(500).send({
      status: "FAILED",
      message: errorMessage,    
    })
  }
}


const healPlayer = async (req, res) => {

  console.log("\n========= HEALING PLAYER =========");

  try {
    const { email, disease } = req.body;

    // Validate data  
    if (!email) {throw new Error("Email not provided")}
    if (!disease) {throw new Error("Disease not provided")}
    if (!disease?.modifiers || typeof disease?.modifiers !== 'object') {throw new Error("Disease does not have an expected structure.")}

    // Get player data
    const acolyte = await findPlayerByEmail(email);
    if (acolyte === null) {throw new Error(`Could not find acolyte with email ${email}.`)}

    // Check if player suffers the disease
    if (!acolyte.diseases.includes(disease.name)) {throw new ValidationError(`Acolyte does not suffer ${disease.name}.`)}

    // Apply penalties 
    const newAttributes = applyHealingReward(acolyte.attributes, disease.modifiers);

    // Remove disease name from diseases attribute.
    const newDiseases = [...acolyte.diseases].filter(diseaseName => diseaseName !== disease.name);

    // Update the changes in the database.
    acolyte.diseases = newDiseases;

    acolyte.attributes = newAttributes;
    acolyte.markModified('attributes'); // Tells Mongoose the 'attributes' object changed so it will save those updates.
  
    // Save the changes in the database.
    await acolyte.save(); 
     
    // Return the new player data.
    return res.status(200).send({ status: "OK", playerData: acolyte });

  } catch (error) {
    console.log("Error sickening player: ", error.message); 
    const errorMessage = error.name === 'ValidationError' ? error.message : `Internal Error: ${error.message}`;  
    return res.status(500).send({
      status: "FAILED",
      message: errorMessage,    
    })
  }
}

const rest = async (req, res) => {

  console.log(`\n========= PLAYER IS RESTING =========`);

  try {

    const {email} = req.body;
    if (!email || typeof email !== "string") {throw new Error("Email field is not valid!")}

    const restedPlayer = await restPlayer(email);
    
    return res.status(200).send({ status: "OK", restedPlayer: restedPlayer });


  } catch (error) {
    console.log("Error resting player: ", error.message);
    const errorMessage = error.name === 'ValidationError' ? error.message : `Internal Error: ${error.message}`;  
    return res.status(500).send({
      status: "FAILED",
      message: errorMessage,    
    })
  }

} 

module.exports = {
  getAllPlayers,
  getAllAcolytes,
  updateOrCreate,
  toggleLaboratoryEntrance,
  updatePlayerAttributes,
  sickenPlayer,
  healPlayer,
  rest
};