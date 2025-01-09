const { getLoyalAcolytes } = require('../../database/Player')

const diseases = [
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

const sickenCron = async () => {

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

    const disease = diseases[Math.floor(Math.random() * diseases.length)];

    // If the player already suffers the disease dont do anything.
    if (acolyte?.diseases !== undefined && acolyte?.diseases.includes(disease.name)) {
      console.log(`The player ${acolyte.email} already suffer the ${disease.name} disease. No disease will be applied.`);
      return;
    }
    
    // Apply the disease to the player.
    applyDisease(acolyte, disease);

    console.log(`The player ${acolyte.email} has been sickened of ${disease.name}. The penalty have been applied sucessfully.`)

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

module.exports = {
  sickenCron
}
