const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const dotenv = require('dotenv');
const mongoose = require('mongoose');

//Import function for update in MongoDB
const { updatePlayer } = require('./src/database/Player');

//Import model
const Player = require('./src/models/playerModel');

//Import routes
const authRoutes = require('./src/routes/authRoutes');

const playerRouter = require("./src/routes/playerRoutes");

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


// Create a conection with a client device 
io.on("connection", (socket) => {

  console.log("\nConnection is made with the following socket id ---> "+ socket.id);
  // Return the socket Id  to the client using a socket
  io.to(socket.id).emit("connection", { socketId: socket.id });
  
  // Add to listen to the function to update the socket Id of the client
  socket.on("updateSocketId", (emailSocketId) => {
    console.log("\nUpdate the socket id with the following data:");
    console.log("     email --> "+ emailSocketId.email);
    console.log("     socketId --> "+ emailSocketId.socketId);

    //convert string to object
    const socketIdObject = {socketId: emailSocketId.socketId};
    //update the socketId
    updatePlayer(emailSocketId.email, socketIdObject);
    
  });

  // Escucha el evento "Acolite scanned"
  socket.on("acoliteScanned", (data) => {
    console.log("Acolite scanned:", data);

     // Emitir un mensaje de confirmación al cliente
     io.to(data.socketId).emit("acoliteScannedResponse", { message: "acolyte successfully scanned" });
    });

});

//Use bodyparser (but express should be enough)
//app.use(bodyParser.json());

// Middleware to parse JSON
app.use(express.json());


// Route API
app.use('/api/token', authRoutes);
app.use("/api/players", playerRouter);

// Start the server
const PORT = process.env.PORT || 3000;

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



