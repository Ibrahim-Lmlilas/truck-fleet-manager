const mongoose = require('mongoose');

const pneuSchema = new mongoose.Schema({

    reference: {
        type: String,
        required: [true, 'La référence est obligatoire'],
        trim: true
    },

    camion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camion',
        required: [true, 'Le camion est obligatoire']
    },

    position: {
        type: String,
        required: [true, 'La position est obligatoire'],
        enum: [
            'avant gauche',
            'avant droit',
            'arrière gauche 1',
            'arrière gauche 2',
            'arrière droit 1',
            'arrière droit 2',
            'secours'
        ]
    },

    kmPose: {
        type: Number,
        required: [true, 'Le km de pose est obligatoire'],
        min: [0, 'Le km doit être positif']
    },

    kmMax: {
        type: Number,
        required: [true, 'Le km max est obligatoire'],
        default: 80000
    },

    statut: {
        type: String,
        enum: ['bon', 'usé', 'à remplacer', 'remplacé'],
        default: 'bon'
    },

    dateRemplacement: {
        type: Date
    },

    prix: {
        type: Number,
        min: [0, 'Le prix doit être positif']
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual: calculer pourcentage d'usure
pneuSchema.virtual('usurePercentage').get(function () {
    if (this.camion && typeof this.camion === 'object' && this.camion.kilometrage != null) {
        const kmActuel = this.camion.kilometrage;
        const kmParcouru = kmActuel - this.kmPose;
        const kmTotal = this.kmMax - this.kmPose;
        if (kmTotal <= 0) return 100;
        const usure = Math.round((kmParcouru / kmTotal) * 100);
        return Math.min(100, Math.max(0, usure));
    }
    return null;
});

pneuSchema.index({ camion: 1, position: 1 });

module.exports = mongoose.model('Pneu', pneuSchema);