const mongoose = require('mongoose');

const trajetSchema = new mongoose.Schema({

    chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Le chauffeur est obligatoire']
    },

    camion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camion',
        required: [true, 'Le camion est obligatoire']
    },

    remorque: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Remorque',
    },

    dateDepart: {
        type: Date,
        required: [true, 'La date de départ est obligatoire']
    },

    dateArrivee: {
        type: Date,
        required: [true, 'La date d\'arrivée est obligatoire']
    },

    lieuDepart: {
        type: String,
        required: [true, 'Le lieu de départ est obligatoire'],
        trim: true
    },

    lieuArrivee: {
        type: String,
        required: [true, 'Le lieu d\'arrivée est obligatoire'],
        trim: true
    },

    kmDepart: {
        type: Number,
        min: [0, 'Le km départ doit être positif']
    },

    kmArrivee: {
        type: Number,
        min: [0, 'Le km arrivée doit être positif']
    },

    gasoilConsomme: {
        type: Number,
        min: [0, 'Le gasoil doit être positif']
    },

    statut: {
        type: String,
        enum: ['à faire', 'en cours', 'terminé', 'annulé'],
        default: 'à faire'
    },

    remarques: {
        type: String,
        trim: true
    },

    description: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
});

trajetSchema.index({ chauffeur: 1, statut: 1 });
trajetSchema.index({ dateDepart: -1 });

module.exports = mongoose.model('Trajet', trajetSchema);