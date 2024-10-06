const { verifyToken } = require('../services/firebaseService');

/**
 * Authenticates the user by verifying the Firebase token.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const authenticate = async (req, res) => {
    
    const { tokenId } = req.body;
    // console.log("TOKEN: ", tokenId)
    
  if (!tokenId) {
    return res.status(400).json({ message: 'El token de Firebase es requerido' });
  }

  try {

    // Verify the token with Firebase
    const decodedToken = await verifyToken(tokenId);
    const { uid, email, name, picture } = decodedToken;

    // Respond with decoded token data
    res.status(200).json({
      message: 'Autenticación correcta',
      user: {
        uid,
        email,
        nombre: name || null,
        foto: picture || null
      }
    });

    console.log("Autenticación Correcta:");
    console.log(decodedToken);

  } catch (error) {
    console.log('Error de autenticación:', error.message);
    res.status(401).json({ message: 'Autenticación fallida', error: error.message });
  }
};

module.exports = {
  authenticate
};