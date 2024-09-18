const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const mongodbRoute = "mongodb+srv://test_user_1:tst_sr_1@cluster0.18tpd.mongodb.net/E4P1?retryWrites=true&w=majority&appName=Cluster0"

const workoutRouter = require("./src/routes/workoutRoutes.js")

const app = express()
const PORT = process.env.PORT || 3000

// User bodyparser
app.use(bodyParser.json())

app.use("/api/workouts", workoutRouter)

async function start() {
    
    try {
        
        await mongoose.connect(mongodbRoute)
        app.listen(PORT, () => {
            console.log(`API is listening to port ${PORT}`)
        });
        console.log("Conexión con Mongo correcta");

    } catch (error)
    {
        console.log(`Error al conectar a la base de datos: ${error.message}`)
    }

}

start()