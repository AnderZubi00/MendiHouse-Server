
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin Initialized correctly.');
} catch (error) {
  console.error('Error starting Firebase Admin:', error);
  process.exit(1);
};

/**
 * Verifies Firebase token
 * @param {string} token - JWT to verify
 * @returns {Promise<object>} - Decoded Token if valid
 * @throws {Error} - Wether the token is valid or expired
 */

const verifyToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifing the token:', error);
    throw new Error('Invalid or unexpected token');
  }
};

module.exports = {
  verifyToken
};
