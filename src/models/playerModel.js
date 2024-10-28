// Cargamos el módulo de mongoose
const mongoose = require('mongoose');

//Usaremos los esquemas
const { Schema } = mongoose;

// Creamos el objeto esquema y sus atributos
const playerSchema = new Schema({
    attributes: Object,
    equipment: Object,
    inventory: Object,
    _id: String,
    name: String,
    nickname: String,
    email: String,
    avatar: String,
    classroom_Id: String,
    level: Number,
    experience: Number,
    is_active: Boolean,
    profile: Object,
    tasks: Array,
    gold: Number,
    created_date: Date,
    socketId: String,
    isInsideLab: Boolean,
    isInsideTower: Boolean,
    fcm_token: String,
    role: String,
    cardId: String
});

// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('Player', playerSchema);