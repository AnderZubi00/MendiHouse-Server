// Cargamos el módulo de mongoose
const mongoose = require('mongoose');

//Usaremos los esquemas
const { Schema } = mongoose;

// Define a schema for storing the access token
const tokenSchema = new mongoose.Schema({
    accessToken: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1h' } // Optional: auto-expire token after 1 hour
  });
  
  module.exports = mongoose.model('Token', tokenSchema);
  