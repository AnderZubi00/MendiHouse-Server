// Cargamos el módulo de mongoose
const mongoose = require('mongoose');

//Usaremos los esquemas
const { Schema } = mongoose;

// Creamos el objeto esquema y sus atributos
const artefactSchema = new Schema({
    _id: String,
    name: String,
    coordenates: {
        latitude: Number,
        longitude: Number,
        },
    collected: Boolean,
});

// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('Artefact', artefactSchema);