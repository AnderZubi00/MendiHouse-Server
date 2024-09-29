const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');

const mongoose = require('mongoose');
const mongodbRoute = process.env.MONGO_URI;
//import bodyParser from "body-parser";



dotenv.config();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

// Create a conection with a client device 
io.on("connection", (socket) => {

  console.log("\nConnection is made with the following socket id ---> "+ socket.id);
  // Return the socket Id  to the client using a socket
  io.to(socket.id).emit("connection", `${socket.id}`);
  
  // Add to listen to the function to update the socket Id of the client
  socket.on("updateSocketId", (emailSocketId) => {
    console.log("\nUpdate the socket id with the following data:");
    console.log("     email --> "+ emailSocketId.email);
    console.log("     socketId --> "+ emailSocketId.socketId);
  
});

});



//Use bodyparser
//app.use(bodyParser.json());

// Middleware to parse JSON
app.use(express.json());

// Route API
app.use('/api/token', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
const PORT_MONGO = 27017;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });

httpServer.listen(PORT, '0.0.0.0', () => {
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



