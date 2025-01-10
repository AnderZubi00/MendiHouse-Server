const { getLoyalAcolytes } = require('../../database/Player')
const { updateClientPlayerData } = require('../../utils/utils')

const epicDiseases = [
  {
    name: 'Putrid Plague',
    modifiers: { intelligence: 75 } // -75%
  },
  {
    name: 'Medular Apocalypse',
    modifiers: { constitution: 30 } // -30%
  },
  {
    name: 'Epic Weakness',
    modifiers: { strength: 60 } // -60%
  }
]

const sickenCron = async (io) => {

  try {

    console.log("EXECUTING SICKEN CRON");

    // Get a loyal player randomly to apply the disease.
    const acolyte = await choseAcolyteRandomly();

    // There will be a 50% of chance to sicken a loyal acolyte.
    const willSickenPlayer = Math.random() > 0.5;

    if (!willSickenPlayer) {
      console.log("Luckily, no player will be sicken (there is 50% chance).")
      return
    }  

    const disease = epicDiseases[Math.floor(Math.random() * epicDiseases.length)];

    // If the player already suffers the disease dont do anything.
    if (suffersEpicDisease(acolyte.diseases)) {
      console.log(`The player ${acolyte.email} already suffer a epic disease. No disease will be applied.`);
      return;
    } 

    // Apply the disease to the player.
    await applyDisease(acolyte, disease);

    console.log(`The player ${acolyte.email} has been sickened of ${disease.name}. The penalty have been applied sucessfully.`)

    // Update the sicken player's 'playerData' context value.
    await updateClientPlayerData(acolyte.email, io);  
 
  } catch (error) {
    console.log("Error in sicken cron: ", error);
  }

}

const applyDisease = async (acolyte, disease) => {

  // Apply the disease to the player.
  acolyte.diseases.push(disease.name);

  // Calculate the penalties. 
  const modifier = Object.keys(disease.modifiers)[0];
  const decreasePercentage = (100 - disease.modifiers[modifier]) / 100;
  const currentValue = acolyte.attributes[modifier];

  // Apply the penalty.
  acolyte.attributes[modifier] = currentValue * decreasePercentage;
  acolyte.markModified('attributes'); // Tells Mongoose the 'attributes' object changed so it will save those updates.

  // Make the change in the database.
  await acolyte.save();
}

const choseAcolyteRandomly = async () => {

  const acolytes = await getLoyalAcolytes();

  if (acolytes.length === 0) {
    throw new Error("There are not loyal acolytes in the database");
  }

  const randomAcolyte = acolytes[Math.floor(Math.random() * acolytes.length)];

  return randomAcolyte;
}

const suffersEpicDisease = (playerDiseasesNames) => {

  if (epicDiseases === undefined || epicDiseases.length === 0) { return false }

  const hasDisease = epicDiseases.map((epicDisease) => {
    return playerDiseasesNames.includes(epicDisease.name);
  })

  return hasDisease.some(hasDisease => hasDisease);
}

module.exports = {
  sickenCron
}
