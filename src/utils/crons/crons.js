
const { getLoyalAcolytes, updateAttribute, findPlayerByEmail } = require('../../database/Player')
const { round } = require('../utils');

const resistanceCron = async () => {

  try {

    const acolytes = await getLoyalAcolytes();

    acolytes.forEach(async (acolyte) => {

      console.log(`UPDATING ATTRIBUTES OF ${acolyte?.nickname}`);
      
      if (!acolyte.attributes.resistence === undefined) {
        throw new Error("Could not find attribute resistence on player");
      }

      // Decrease resistance
      const currentResistence = acolyte.attributes.resistence;
      const newResistence = round(currentResistence * 0.9);
      let weakenedPlayer = await updateAttribute(acolyte.email, "resistence", newResistence);

      // Apply penalities.
      weakenedPlayer = await applyPenalty(weakenedPlayer, "strength");
      weakenedPlayer = await applyPenalty(weakenedPlayer, "dexterity");
      weakenedPlayer = await applyPenalty(weakenedPlayer, "intelligence");

      // Increase insanity
      if (newResistence < 50) {

        const insanity = weakenedPlayer.attributes.insanity;

        if (!insanity) {
          throw new Error("Could not find attribute insanity in no player");
        }

        const insanityPercentage = 50 - newResistence;
        const newInsanity = round(insanity + (insanity * insanityPercentage));

        weakenedPlayer = await updateAttribute(weakenedPlayer.email, "insanity", newInsanity);
      }

    });

  } catch (error) {
    console.log("Error in resistance cron: ", error);
  }
}

const applyPenalty = async (player, attribute) => {

  try {

    if (!player.attributes[attribute] === undefined) {
      throw new Error(`Could not find attribute ${attribute} in player.`);
    }

    const resistence = player.attributes.resistence;
    const attributeValue = player.attributes[attribute];
    const newAttribute = round(attributeValue * resistence / 100);

    const updatedPlayer = updateAttribute(player.email, attribute, newAttribute);

    return updatedPlayer;

  } catch (error) {
    throw error;
  }

}

module.exports = {
  resistanceCron
}