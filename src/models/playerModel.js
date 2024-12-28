// Cargamos el módulo de mongoose
const mongoose = require('mongoose');
const { angeloInDungeon } = require('../database/Player');

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
    isInsideHall: Boolean,
    obituaryDiscovered: Boolean,
    fcm_token: String,
    role: String,
    cardId: String,
    isBetrayer: Boolean,
    diseases: Array,
    hasAngeloCaptured: { type: Boolean, default: null },
    angeloInDungeon: { type: Boolean, default: false },
});

// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('Player', playerSchema);