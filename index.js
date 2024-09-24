const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mongodbRoute = 'String de conexion con MongoDB';
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');

const mongoose = require('mongoose');
const mongodbRoute = process.env.MONGO_URI;
//import bodyParser from "body-parser";


dotenv.config();

const playerRouter = require("./routes/playerRoutes")

const app = express();

//Use bodyparser
//app.use(bodyParser.json());

// Middleware to parse JSON
app.use(express.json());

// Route API
app.use('/api/token', authRoutes);

//Use bodyparser
app.use(bodyParser.json());

app.use("/api/players", playerRouter);

// Start the server
const PORT = process.env.PORT || 3000;
const PORT_MONGO = 27017;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});


async function start() {
  try {

    await mongoose.connect(mongodbRoute);
    app.listen(PORT_MONGO, () => {
     
      console.log(`Api is listenning on port ${PORT_MONGO}`);
    })
    console.log('Conexion con Mongo correcta');
    
    
  } catch (error) {
    console.log(`<<ERROR>> connecting to the database: ${error.message}`);
    
  }
}

start();



