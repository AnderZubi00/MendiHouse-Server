const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const mqtt = require('mqtt'); // Import the MQTT package
const fs = require('fs');
const idCardHandler = require('./src/mqtt/idCardHandler');
const doorStatusHandler = require('./src/mqtt/doorStatusHandler');

const { updatePlayerByEmail, getAllAcolytes, toggleIsInsideLabByEmail, toggleIsInsideTowerByEmail, findPlayerByEmail } = require('./src/database/Player');



// ------------------------------------- //
// -----   GENERAL CONFIGURATION   ----- //
// ------------------------------------- //

//Connfigurate enviroment variables
dotenv.config();

//Mongo route 
const mongodbRoute = process.env.MONGO_URI;

//Inicialize app express
const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ---- MQTT CONFIGURATION ---- //

//Load the certificates
const mqttOptions = {
  clientId: 'MendiHouse-Node.js',
  key: fs.readFileSync('./certificates/server.key'),
  cert: fs.readFileSync('./certificates/server.crt'),
  ca: fs.readFileSync('./certificates/ca.crt')
};

// const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, mqttOptions);

// ------------------------ //
// -----   REST API   ----- //
// ------------------------ //

//Import routes
const authRoutes = require('./src/routes/authRoutes');
const playerRouter = require("./src/routes/playerRoutes");

// Middleware to parse JSON
app.use(express.json());

// Route API
app.use('/api/token', authRoutes);
app.use("/api/players", playerRouter);

// Start the server
const PORT = process.env.PORT || 3000;


// ------------------------ //
// -----   SOCKETS   ------ //
// ------------------------ //

// Create a conection with a client device 
io.on("connection", (socket) => {

  console.log("\nConnection is made with the following socket id ---> " + socket.id);
  // Return the socket Id  to the client using a socket
  io.to(socket.id).emit("connection", { socketId: socket.id });

  // Add to listen to the function to update the socket Id of the client
  socket.on("updateSocketId", (emailSocketId) => {

    console.log("\n========= UPDATE SOCKET ID =========");

    console.log("Update the socket id with the following data:");
    console.log("     email --> " + emailSocketId.email);
    console.log("     socketId --> " + emailSocketId.socketId);

    // Convert string to object
    const socketIdObject = { socketId: emailSocketId.socketId };

    // Update the socketId
    updatePlayerByEmail(emailSocketId.email, socketIdObject);

  });

  socket.on("acolyteScanned", async (data) => {

    try {

      console.log("\n========= ACOLYTE SCANNED =========");

      console.log("Data received in 'acolyteScanned': ", data);

      if (!data?.email) throw new Error("Data has no email attribute");

      let acolyteEmail = data?.email;

      console.log("Acolyte scanned. Email: ", acolyteEmail);

      // Await the asynchronous operation to ensure it completes
      const newPlayerData = await toggleIsInsideLabByEmail(acolyteEmail);

      console.log("SOCKETID: ", newPlayerData.socketId);

      // Send confirmation message to the client who scanned the acolyte
      io.to(newPlayerData.socketId).emit("acolyteScannedResponse", { success: true, playerData: newPlayerData }); /// Acolyte
      io.to(socket.id).emit("acolyteScannedResponse", { success: true, playerData: newPlayerData }); // Istvan

      // Notify clients to refresh Mortimer's list
      const acolyteList = await getAllAcolytes();
      io.emit("refreshMortimerList", acolyteList);

    } catch (error) {

      console.log('Error in method acolyteScanned. Error: ', error);

      // Send error message to the client
      io.to(data.socket).emit("acolyteScannedResponse", { success: false, erorMessage: error });
      io.to(socket.id).emit("acolyteScannedResponse", { success: false, erorMessage: error });
    }

  });

});

// --------------------- //
// -----   MQTT   ------ //
// --------------------- //

// ///Susbcrbe to topic 'idCard' and handle all the logic 
// idCardHandler.handleIdCardAccess(io, mqttClient);


// ///Subscribe to topic 'doorStatus' and handle all the logic 
// doorStatusHandler.handleDoorAccess(mqttClient, io);

//////////////////

// --------------------------- //
// -----   RUN SERVER   ------ //
// --------------------------- //

async function start() {

  try {

    //Start server for authentification
    httpServer.listen(PORT, '0.0.0.0', () => {
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


// ---------------------------------- //
// -----   UTILITY FUNCTIONS   ------ //
// ---------------------------------- //


// getPlayerScreen(email, io);

