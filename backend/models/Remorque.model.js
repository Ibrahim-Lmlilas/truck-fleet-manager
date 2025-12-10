const mongoose = require('mongoose');

const remorqueSchema = new mongoose.Schema({

    matricule: {
        type: String,
        required: [true, 'Le matricule est obligatoire'],
        unique: true,
        uppercase: true,
        trim: true
    },

    type: {
        type: String,
        required: [true, 'Le type est obligatoire'],
        enum: ['bâchée', 'frigorifique', 'plateau', 'citerne', 'porte-conteneur'],
        trim: true
    },

    capacite: {
        type: Number,
        required: [true, 'La capacité est obligatoire'],
        min: [1, 'La capacité doit être positive']
    },

    statut: {
        type: String,
        enum: ['disponible', 'en mission', 'en panne', 'en maintenance'],
        default: 'disponible'
    },

    remarques: {
        type: String,
        trim: true
    }

}, {
    timestamps: true
});

remorqueSchema.index({ type: 1 });
remorqueSchema.index({ capacite: 1 });

module.exports = mongoose.model('Remorque', remorqueSchema);