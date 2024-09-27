const express = require('express');
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

//Import routes
const authRoutes = require('./src/routes/authRoutes');

const playerRouter = require("./src/routes/playerRoutes");

//Connfigurate enviroment variables
dotenv.config();

//Mongo route 
const mongodbRoute = process.env.MONGO_URI;

//Inicialize app express
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

// Middleware to parse JSON
app.use(express.json());

//Use bodyparser (but express should be enough)
app.use(bodyParser.json());

// Route API
app.use('/api/token', authRoutes);
app.use("/api/players", playerRouter);

// Start the server
const PORT = process.env.PORT || 3000;


async function start() {

  try {

    //Start server for authentification
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Connect to mongoose
    await mongoose.connect(mongodbRoute, {});
    console.log('Conexion con Mongo correcta');
    
  } catch (error) {
    console.log(`<<ERROR>> connecting to the database: ${error.message}`);
    
  }
}

start();



