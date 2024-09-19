
const express = require('express');
const router = express.Router();
const { authenticate } = require('../controller/authController');

// Route to authenticate the user using firebase
router.post('/login', authenticate);

module.exports = router;
