
const { getLoyalAcolytes, updateAttribute } = require('../../database/Player')
const { round } = require('../math');
const { updateClientPlayerData } = require('../utils')

const resistanceCron = async (io) => {

  try {
    console.log("EXECUTING RESISTENCE CRON");
    const loyalAcolytes = await getLoyalAcolytes();
    for (const acolyte of loyalAcolytes) {
      await weakenAcolyte(acolyte, io);
    }
  } catch (error) {
    console.log("Error in resistance cron: ", error);
  }
}

const weakenAcolyte = async (acolyte, io) => {

  console.log(`UPDATING ATTRIBUTES OF ${acolyte?.nickname}`);
   
  if (acolyte?.attributes?.resistence == null) { // Verifica tanto null como undefined
    throw new Error("Could not find attribute resistence on player");
  }

  // Decrease resistance
  const currentResistence = acolyte.attributes.resistence;
  const newResistence = currentResistence * 0.9 || 0;
  let weakenedPlayer = await updateAttribute(acolyte.email, "resistence", newResistence);

  // Apply penalities.
  weakenedPlayer = await applyPenalty(weakenedPlayer, "strength");
  weakenedPlayer = await applyPenalty(weakenedPlayer, "dexterity");
  weakenedPlayer = await applyPenalty(weakenedPlayer, "intelligence");

  // Increase insanity
  if (newResistence < 50) {

    const insanity = weakenedPlayer.attributes.insanity;

    if (insanity === undefined || insanity === null) {
      throw new Error("Could not find attribute insanity in the player");
    }

    const insanityPercentage = 50 - newResistence; // Porcentaje de incremento
    const incrementFactor = insanityPercentage / 100; // Convertir a decimal
    const newInsanity = insanity * (1 + incrementFactor);

    weakenedPlayer = await updateAttribute(weakenedPlayer.email, "insanity", newInsanity);
  } 

  // Update the sicken player's 'playerData' context value.
  await updateClientPlayerData(acolyte.email, io);  

}

const applyPenalty = async (player, attribute) => {

  try {

    if (typeof player.attributes[attribute] === 'undefined') {
      throw new Error(`Could not find attribute ${attribute} in player.`);
    }

    const resistence = player.attributes.resistence;
    const attributeValue = player.attributes[attribute];
    const newAttribute = attributeValue * resistence / 100 || 0;

    const updatedPlayer = await updateAttribute(player.email, attribute, newAttribute);

    return updatedPlayer;

  } catch (error) {
    throw error;
  }

}

module.exports = {
  resistanceCron
}