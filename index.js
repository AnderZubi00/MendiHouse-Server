const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const mqtt = require('mqtt'); // Import the MQTT package
const fs = require('fs');
const admin = require('firebase-admin')
const idCardHandler = require('./src/mqtt/idCardHandler');
const doorStatusHandler = require('./src/mqtt/doorStatusHandler');

const { updatePlayerByEmail, getAllAcolytes, toggleIsInsideLabByEmail, toggleIsInsideTowerByEmail, findPlayerByEmail} = require('./src/database/Player');


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
  ca: fs.readFileSync('./certificates/ca.crt'),
  rejectUnauthorized: true
}; 

// const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL, mqttOptions); // Para añadir los certificados a la conexion
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

// ------------------------ //
// -----   REST API   ----- //
// ------------------------ //

//Import routes
const authRoutes = require('./src/routes/authRoutes');
const playerRouter = require("./src/routes/playerRoutes");
const { messageSomeoneIsTryingToEnter, messageSomeoneSuccesfullyOpenDoor, messageSomeoneFailedOpenDoor } = require('./src/messages/messagesTheTower');

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

///Susbcrbe to topic 'idCard' and handle all the logic 
// idCardHandler.handleIdCardAccess(mqttClient);

///Subscribe to topic 'doorStatus' and handle all the logic 
doorStatusHandler.handleDoorAccess(mqttClient, io);

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


async function toggleAcolyteInsideTower(email) {

  try {
    console.log("\n========= TOOGLE ACOLYTE INSIDE TOWER =========");

    if (!email) throw new Error("Email parameter is null or undefined");

    let playerCurrentScreen = await getPlayerScreen(email);

    // Obtain the player data of Mortimer
    const mortimerData = await findPlayerByEmail("aitor.mendiburu@ikasle.aeg.eus");
    console.log("Mortimer Data: ");
    console.log(mortimerData);


    // Obtain the fcm_token from the player data to send the push notification
    const fcm_token = mortimerData.fcm_token;

    // Clone the message object to modify to send it
    const messageWarningSomeoneIsTryingToEnterTheTower = structuredClone(messageSomeoneIsTryingToEnter);
    // Add the fcm_token to the message tokens to send the message to the correct device/user
    messageWarningSomeoneIsTryingToEnterTheTower.tokens.push(fcm_token);

    console.log(messageWarningSomeoneIsTryingToEnterTheTower);

    // Send message to mortimer that an acolyte is trying to access
    sendPushNotification(messageWarningSomeoneIsTryingToEnterTheTower);

    if (playerCurrentScreen !== "TowerDoorScreen" && playerCurrentScreen !== "Tower Screen") {
      console.log("The player is not in the screen 'TowerDoorScreen' or inside the Tower, so he can not enter or exit the tower.");

      // Clone the message object to modify to send it
      const messageWarningSomeoneFailedOpeningTheTowerDoor = structuredClone(messageSomeoneFailedOpenDoor);
      // Add the fcm_token to the message tokens to send the message to the correct device/user
      messageWarningSomeoneFailedOpeningTheTowerDoor.tokens.push(fcm_token);

      console.log(messageWarningSomeoneFailedOpeningTheTowerDoor);

      // Send message to mortimer that an acolyte failed to open the door
      sendPushNotification(messageWarningSomeoneFailedOpeningTheTowerDoor);

      return;
    }

    // Await the asynchronous operation to ensure it completes
    const newPlayerData = await toggleIsInsideTowerByEmail(email);

    console.log("SocketId: ", newPlayerData.socketId);

    // Send confirmation message to the client who scanned the acolyte
    io.to(newPlayerData.socketId).emit("toggleInsideTower", { success: true, playerData: newPlayerData });

    console.log('Acolyte has entered or exited the tower successfully');

    // Clone the message object to modify to send it
    const messageWarningSomeoneSuccessOpeningTheTowerDoor = structuredClone(messageSomeoneSuccesfullyOpenDoor);
    // Add the fcm_token to the message tokens to send the message to the correct device/user
    messageWarningSomeoneSuccessOpeningTheTowerDoor.tokens.push(fcm_token);

    console.log(messageWarningSomeoneSuccessOpeningTheTowerDoor);

    // Send message to mortimer that an acolyte failed to open the door
    sendPushNotification(messageWarningSomeoneSuccessOpeningTheTowerDoor);

  } catch (error) {
    console.log('Error entering the acolyte to tower. Error: ', error);
  }
}


async function getPlayerScreen(email) {

  console.log("\n========= GET PLAYER CURRENT SCREEN =========");

  try {
    const playerData = await findPlayerByEmail(email);
    if (!playerData) {
      throw new Error("Player not found");
    }
    const { socketId } = playerData;

    // Return a promise to be able to use await() when calling to this method.
    return new Promise((resolve, reject) => {
      io.timeout(3000).to(socketId).emit("playerScreen", {}, (err, response) => {

        if (err) {
          console.error("Error receiving response from client:", err);
          return reject(err);
        }

        console.log("Respuesta recibida del cliente:", response[0]);

        // Get and return the screen name the player.
        if (response[0]?.success) {
          let { data } = response[0];
          if (data) {
            let { route } = data;
            if (route) {
              return resolve(route);  // Resolve the promise
            }
          }
        } else {
          console.log("El cliente respondió con un error:", response.errorMessage);
        }

        // If the response do not have a valid screen name, resolve with undefined.
        return resolve(undefined);

      });
    });

  } catch (error) {
    console.log('Error en getPlayerScreen:', error);
    throw error;
  }
}

async function getDataFromTheEmail(email) {

}

function sendPushNotification(message) {

  admin
    .messaging()
    .sendEachForMulticast(message)
    .then(response => {
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      console.log('Error sending message:', error);
    });
}