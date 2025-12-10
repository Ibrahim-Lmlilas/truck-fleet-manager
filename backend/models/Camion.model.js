const mongoose = require('mongoose');

const camionSchema = new mongoose.Schema({

    matricule: {
        type: String,
        required: [true, 'Le matricule est obligatoire'],
        unique: true,
        uppercase: true,
        trim: true
    },

    marque: {
        type: String,
        required: [true, 'La marque est obligatoire'],
        trim: true
    },

    modele: {
        type: String,
        required: [true, 'Le modèle est obligatoire'],
        trim: true
    },

    annee: {
        type: Number,
        required: [true, 'L\'année est obligatoire'],
        min: [1990, 'Année invalide'],
        max: [new Date().getFullYear() + 1, 'Année invalide']
    },

    kilometrage: {
        type: Number,
        required: [true, 'Le kilométrage est obligatoire'],
        min: [0, 'Le kilométrage doit être positif'],
        default: 0
    },

    statut: {
        type: String,
        enum: ['disponible', 'en mission', 'en panne', 'en maintenance'],
        default: 'disponible'
    },

    derniereMaintenanceKm: {
        type: Number,
        default: 0
    },

    remarques: {
        type: String,
        trim: true
    }
},{
    timestamps : true 
});

camionSchema.index({marque: 1 });
camionSchema.index({modele: 1 });
camionSchema.index({annee: 1 });

module.exports = mongoose.model('Camion',camionSchema);

