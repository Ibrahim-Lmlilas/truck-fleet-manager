const mongoose = require('mongoose');


const maintenanceSchema = new mongoose.Schema({

    type: {
        type: String,
        enum: ['vidange', 'révision', 'pneus', 'freins', 'autre'],
        required: [true, 'Le type est obligatoire']
    },

    vehicule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camion',
        required: [true, 'Le véhicule est obligatoire']
    },

    datePrevu: {
        type: Date,
        required: [true, 'La date prévue est obligatoire']
    },

    dateFait: {
        type: Date
    },

    kmMaintenance: {
        type: Number,
        min: [0, 'Le km doit être positif']
    },

    cout: {
        type: Number,
        min: [0, 'Le coût doit être positif']
    },

    statut: {
        type: String,
        enum: ['planifiée', 'en cours', 'effectuée', 'reportée'],
        default: 'planifiée'
    },

    remarques: {
        type: String,
        trim: true
    },

    prochainKm: {
        type: Number
    }

}, {
    timestamps: true
});

maintenanceSchema.index({ vehicule: 1, datePrevu: 1 });
maintenanceSchema.index({ statut: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);