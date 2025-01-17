const Player = require('../database/Player');
const { updateAttribute } = require('../database/Player');
const ValidationError = require('../utils/errors');
const { resetAttribute } = require('../utils/math');
const { updateClientPlayerData, refreshAcolytesList  } = require("../utils/utils")

// Service to get all players from the database
const getAllPlayers = async () => {
  try {
    console.log("Fetching all players from the database");
    const players = await Player.getAllPlayers();
    // console.log("Players fetched:", players); 
    return players;
  } catch (error) {
    console.log("Error fetching players:", error);
    throw error;
  }
};

// Service for the route to get all the players with the role ACOLYTE
const getAllAcolytes = async () => {
  try {
    console.log("Fetching all players with the role ACOLYTE from the database");
    const players = await Player.getAllAcolytes();
    // console.log("Players fetched:", players); 
    return players;
  } catch (error) {
    console.log("Error fetching players:", error);
    throw error;
  }
};

const getRole = (playerData) => {

  let role;
  if (playerData.email === "classcraft.daw2@aeg.eus") role = "ISTVAN";
  else if (playerData.email === "ozarate@aeg.eus") role = "VILLAIN";
  else if (playerData.email === "oskar.calvo@aeg.eus") role = "MORTIMER";
  else role = "ACOLYTE";

  console.log("Entered method getRole()");
  console.log(`Returned ${role} role`);

  return role;
}

const createPlayer = async (playerData) => {

  try {
    console.log("Creating new player");
    console.log("Asigning the role to the player:");

    playerData.role = getRole(playerData);
    playerData.socketId = null;
    playerData.isInsideLab = false;
    playerData.isInsideTower = false;
    playerData.isInsideHall = false;
    playerData.obituaryDiscovered = false;
    playerData.cardId = null;
    playerData.isBetrayer = false;
    playerData.hasAngeloCaptured = null;
    playerData.angeloInDungeon = false;

    const newPlayer = await Player.createPlayer(playerData);
    return newPlayer;

  } catch (error) {
    console.log("Error creating player:", error);
    throw error;
  }
};

const updatePlayerByEmail = async (email, playerData) => {
  try {
    console.log(`Updating player with email: ${email}`);
    const updatedPlayer = await Player.updatePlayerByEmail(email, playerData);
    return updatedPlayer;
  } catch (error) {
    console.log("Error updating player:", error);
    throw error;
  }
};

const findPlayerByEmail = async (email) => {
  try {
    const player = await Player.findPlayerByEmail(email);
    return player;
  } catch (error) {
    console.log("Error finding player:", error);
    throw error;
  }
};

const sickenPlayer = async (email, disease, io) => {
  
  try {

    // Get player data
    const acolyte = await findPlayerByEmail(email);
    if (acolyte === null) {throw new Error(`Could not find acolyte with email ${email}.`)}

    // Check if player already suffers the disease
    if (acolyte.diseases.includes(disease.name)) {throw new ValidationError(`Acolyte already suffers ${disease.name}.`)}

    // Validate if is acolyte and is loyal
    if (acolyte.isBetrayer) {throw new ValidationError("The selected acolyte is a betrayer. It can not be sicken.")}

    // Apply penalties 
    const newAttributes = Player.applyDiseasePenalty(acolyte.attributes, disease.modifiers);

    // Push disease name to diseases array
    const newDiseases = [...acolyte.diseases, disease.name];

    // Update the changes in the database.
    acolyte.diseases = newDiseases;

    acolyte.attributes = newAttributes;
    acolyte.markModified('attributes'); // Tells Mongoose the 'attributes' object changed so it will save those updates.
  
    // Make the change in the database.
    await acolyte.save(); 
     
    // Update client's screen.
    await updateClientPlayerData(acolyte.email, io);

    // Refresh Mortimer's screen.
    await refreshAcolytesList(io, "MORTIMER");

    return acolyte;

  } catch (error) {
    throw error;
  }

}


const healPlayer = async (email, disease, io) => {

  try {

    // Get player data
    const acolyte = await findPlayerByEmail(email);
    if (acolyte === null) {throw new Error(`Could not find acolyte with email ${email}.`)}

    // Check if player suffers the disease
    if (!acolyte.diseases.includes(disease.name)) {throw new ValidationError(`Acolyte does not suffer ${disease.name}.`)}

    // Apply penalties 
    const newAttributes = Player.applyHealingReward(acolyte.attributes, disease.modifiers);

    // Remove disease name from diseases attribute.
    const newDiseases = [...acolyte.diseases].filter(diseaseName => diseaseName !== disease.name);

    // Update the changes in the database.
    acolyte.diseases = newDiseases;

    acolyte.attributes = newAttributes;
    acolyte.markModified('attributes'); // Tells Mongoose the 'attributes' object changed so it will save those updates.
  
    // Save the changes in the database.
    await acolyte.save(); 

    // Update client's screen.
    await updateClientPlayerData(acolyte.email, io);

    // No need to refresh Mortimer's screen as this endpoint return the updated player.

    return acolyte;
    
  } catch (error) {
    throw error;
  }

}
const restPlayer = async (email, io) => {

  try {

    const player = await findPlayerByEmail(email);
    if (!player) { throw new Error(`Could not find player with email ${player.email}`) }

    if (player.attributes.resistence === undefined) { throw new Error(`Player does not have resistence attribute`) }
    if (player.attributes.resistence <= 30) { throw new ValidationError(`You must have more than 30 points of resistence to be able to rest. You currently have ${player.attributes.resistence}`) }

    // Example usage:
    const currentStrength = player.attributes.strength;
    const currentDexterity = player.attributes.dexterity;
    const currentIntelligence = player.attributes.intelligence;
    const currentResistance = player.attributes.resistence;

    const restoredlStrength = resetAttribute(currentStrength, currentResistance);
    const restoredlDexterity = resetAttribute(currentDexterity, currentResistance);
    const restoredlIntelligence = resetAttribute(currentIntelligence, currentResistance);

    let restedPlayer = await updateAttribute(player.email, "strength", restoredlStrength);
    restedPlayer = await updateAttribute(player.email, "dexterity", restoredlDexterity);
    restedPlayer = await updateAttribute(player.email, "intelligence", restoredlIntelligence);
    restedPlayer = await updateAttribute(player.email, "resistence", 100);

    // Update client's screen.
    await updateClientPlayerData(restedPlayer.email, io);

    // Refresh Mortimer's screen.
    await refreshAcolytesList(io, "MORTIMER");

    return restedPlayer;

  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllPlayers,
  getAllAcolytes,
  createPlayer,
  updatePlayerByEmail,
  findPlayerByEmail,
  restPlayer,
  sickenPlayer,
  healPlayer
};