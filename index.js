const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const mqtt = require('mqtt'); // Import the MQTT package
const fs = require('fs');
const idCardHandler = require('./src/mqtt/idCardHandler');
const doorStatusHandler = require('./src/mqtt/doorStatusHandler');

const { updatePlayerByEmail, getAllAcolytes, toggleIsInsideLabByEmail, toggleIsInsideTowerByEmail, findPlayerByEmail, findPlayersByRole, updateIsInsideHallByEmail } = require('./src/database/Player');
const { toggleCollectedWithArtefactId, getArtefacts, resetAllCollected } = require('./src/database/Artefact');
const artefactService = require('./src/services/artefactService');
const { getPlayersInsideHall } = require('./src/utils/utils');


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
const artefactsRoutes = require('./src/routes/ArtefactRoutes');

// Middleware to parse JSON
app.use(express.json());

// Route API
app.use('/api/token', authRoutes);
app.use("/api/players", playerRouter);
app.use("/api/artefacts", artefactsRoutes);
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

  ////////////////////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////////////////////
  // Refresh 'Ancient Hall Of Sages' Screen inside Acolytes
  socket.on("refreshAncientHallOfSagesListForPlayers", async (data) => {

    try {

      if (data?.email && data?.isInsideHall != undefined) {

        const { email, isInsideHall } = data;

        console.log("\n========= Player Has Enter/Exit 'Ancient Hall of Sages' =========");
        await updateIsInsideHallByEmail(email, isInsideHall);

        // Get the players data to update the the 'Ancient Hall of Sages'
        const playersObject = await getPlayersInsideHall();
        const allAcolytes = await getAllAcolytes();

        // Check if all acolytes are inside the hall
        const allAcolytesInsideHall = allAcolytes.every(acolyte => acolyte.isInsideHall);

        // Check if all artifacts have been collected. 
        const artifacts = await getArtefacts();
        const allArtifactsCollected = artifacts.every(artifact => artifact.collected);

        // Notify clients to refresh 'Ancient Hall Of Sages' list
        io.emit("refreshAncientHallOfSagesList", {
          playersObject: playersObject,
          allAcolytesInsideHall: allAcolytesInsideHall, 
          allArtifactsCollected: allArtifactsCollected,
        });

        console.log("============================================");

      }
    } catch (error) {
      console.log('Error in method refresh Ancient hall of sages. Error: ', error);
    }

  });


  ///////////////////////////////////////////////////////////////////////////////////////////////
  // Listen for position updates from acolytes
  socket.on('updatePosition', (data) => {
    console.log('Player position updated:', data);

    //   // Broadcast the updated position to all roles
    //   io.emit('playerLocationUpdate', data);
    // });

    // Broadcast the updated position to all other clients, except the sender
    socket.broadcast.emit('playerLocationUpdate', data);

    // socket.on('disconnect', () => {
    //   console.log('user disconnected');
    // });
  });

  ////////////

  // Listen for a new user entering the map and requesting other players' positions
  socket.on("requestOtherPositions", () => {
    console.log("Request for other players' positions received from:", socket.id);

    // Notify all other players to send their position to the server
    // 'orderSendThePosition' is sent to all clients except the requester
    socket.broadcast.emit("orderSendThePosition", { requesterId: socket.id });
  });

  // Listen for positions sent by other clients who are already in the map
  socket.on("sendPositions", (data) => {
    const { coordinates, email, avatar, nickname, role, requesterId } = data;

    console.log(`Position received from ${email}:`, coordinates);

    // Send the position back only to the requesting socket
    io.to(requesterId).emit("receiveOtherLocation", {
      email,
      coordinates,
      avatar,
      nickname,
      role,
    });
  });

  //////////

  // Listen for when a player leaves
  socket.on("playerLeft", ({ email }) => {
    console.log(`Player with email ${email} has left`);

    // Broadcast to all clients to remove this player
    socket.broadcast.emit("removePlayer", { email });
  });

  // // Clean up on disconnect (optional)
  // socket.on("disconnect", () => {
  //   console.log("User disconnected:", socket.id);
  // });


  ///////////////////////////////////////////////////////////////////////////
  socket.on('collectArtefact', async ({ artefactId, collected }) => {
    console.log(`Artefact ID: ${artefactId}, Collect: ${collected}`);

    try {
      const updatedArtefact = await toggleCollectedWithArtefactId(artefactId, collected);
      io.emit('updatedArtefact', {
        artefactId: updatedArtefact._id,
        collected: updatedArtefact.collected,
        artefactName: updatedArtefact.name,
      });
      console.log(`Artefact ${artefactId} updated collected: ${collected}`);
    } catch (error) {
      console.error(`Error updating the artefact ${artefactId}:`, error);
    }
  });

  ///////////////////////////////////////////////////////////////////////////////
  socket.on("checkFourArtefactsCollected", async () => {
    try {
      // Check if all artefacts are collected using the service
      const collectedArtefacts = await artefactService.checkAllCollected();

      if (collectedArtefacts) {
        // Notify all connected clients about the artefact status
        io.emit("updateHallOfSages", { message: "The secrets of the Hall have been unlocked!" });
        socket.emit("fourArtefactsStatus", { status: true, message: "All artefacts collected!", artefacts: collectedArtefacts });
      } else {
        // Notify the requesting client about the status
        socket.emit("fourArtefactsStatus", { status: false, message: "Not all artefacts are collected yet.", artefacts: null });
      }
    } catch (error) {
      console.error("Error checking artefacts collection:", error);
      // Notify the client about the error
      socket.emit("fourArtefactsStatus", { status: false, message: "Error occurred while checking artefacts.", artefacts: null });
    }
  });


  /////////////////////////////////////////////////////////////////////////////////
  socket.on("showArtefactsToMortimer", () => {
    io.emit("pressedShowArtefacts");
  });

  ///////////////////////////////////////////////////////////////////////////////
  socket.on("notifyMortimer", async () => {

      ///find mortimer in players collecton 
      // Obtain the Mortimers data
      const mortimer = await findPlayersByRole("MORTIMER");
      console.log("Data from players with role MORTIMER: ");
      console.log(mortimer);

      // Obtain the fcm_token from the Mortimer players array to send the push notification
      const fcm_tokens = mortimer.fcm_token;

      // Add the text to the message body and title, for the message we want to send on the push notification
      bodyText = 'The acolytes are requesting you in the Ancient Hall of Sage.';
      titleText = 'Acolytes calling you';
      messageTopic = 'NotifyMortimerEnterHall';
  
      // Create the message object to modify to send it, with fcm_token to send the message to the correct device/user
      const messageRequestMortimerInHall = createMessageForPushNotification(bodyText, titleText, fcm_tokens, messageTopic);
  
      console.log(messageRequestMortimerInHall);
  
      // Send message to mortimer that an acolyte failed to open the door
      sendPushNotification(messageRequestMortimerInHall);

  });

  ///////////////////////////////////////////////////////////////////////////////

  socket.on("statusValidateArtifacts", async ({ validated }) => {

    if (!validated) {
      try {
        const rejectArtefacts = await resetAllCollected();
      } catch (error) {
        console.error(`Error rejecting artifacts:`, error);
      }
    } else {
      //console.log("Artifacts validated");
    }
  });

});

///////////////////////////////////////////////////////////////////////////////



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