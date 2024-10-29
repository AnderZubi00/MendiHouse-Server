const Token = require('../models/tokenModel');

// Function to store token
async function storeAccessToken(accessToken, email) {
    const tokenDoc = new Token({ accessToken, email });
    await tokenDoc.save();
    console.log('Access token stored successfully.');
    console.log(accessToken);
  }
  
  // Function to retrieve token by accessToken
  async function findEmailByAccessToken(accessToken) {
    const tokenDoc = await Token.findOne({ accessToken });
    return tokenDoc ? tokenDoc.email : null;
  }

  module.exports = {
    storeAccessToken,
    findEmailByAccessToken
  }