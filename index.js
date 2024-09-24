const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const mongodbRoute = 'String de conexion con MongoDB';
const dotenv = require('dotenv');
const authRoutes = require('./src/routes/authRoutes');

dotenv.config();

const playerRouter = require("./routes/playerRoutes")

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Route API
app.use('/api/token', authRoutes);

//Use bodyparser
app.use(bodyParser.json());

app.use("/api/players", playerRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
