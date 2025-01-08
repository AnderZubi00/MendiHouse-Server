 
const round = (num) => {
  return Math.round(num * 100) / 100;
}   
    
// Used to reset a attribute value when a player rests (apply bonification as the resistence resets).
const resetAttribute = (currentAttribute, currentResistance) => {
  // If resistance is already 100, nothing to undo
  if (currentResistance === 100) return currentAttribute;

  // Number of 10% steps from 100% to currentResistance
  const k = (100 - currentResistance) / 10;

  // Calculate the product of all multipliers (e.g., 0.9, then 0.8, etc.)
  let product = 1;
  for (let i = 1; i <= k; i++) {
    product *= (100 - 10 * i) / 100;
  }

  // Undo all reductions
  let originalAttribute = round(currentAttribute / product);

  return originalAttribute;
}

 
module.exports = {
  round,
  resetAttribute
}