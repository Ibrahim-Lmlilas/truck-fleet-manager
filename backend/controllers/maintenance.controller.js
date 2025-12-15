const Maintenance = require('../models/Maintenance.model');
const Camion = require('../models/Camion.model');

const getAllMaintenances = async (req, res, next) => {
    try {
        const maintenances = await Maintenance.find()
            .populate('vehicule', 'matricule marque modele kilometrage')
            .sort({ datePrevu: 1 });

        res.status(200).json({
            success: true,
            count: maintenances.length,
            data: maintenances
        });
    } catch (error) {
        next(error);
    }
};

const getMaintenanceById = async (req, res, next) => {
    try {
        const maintenance = await Maintenance.findById(req.params.id)
            .populate('vehicule', 'matricule marque modele kilometrage derniereMaintenanceKm');

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: maintenance
        });
    } catch (error) {
        next(error);
    }
};

const getMaintenancesByVehicule = async (req, res, next) => {
    try {
        const maintenances = await Maintenance.find({ vehicule: req.params.vehiculeId })
            .populate('vehicule', 'matricule marque modele kilometrage')
            .sort({ datePrevu: 1 });

        res.status(200).json({
            success: true,
            count: maintenances.length,
            data: maintenances
        });
    } catch (error) {
        next(error);
    }
};

const planifierMaintenance = async (req, res, next) => {
    try {
        const { vehicule, type, datePrevu, kmMaintenance, prochainKm, cout, remarques } = req.body;

        const camion = await Camion.findById(vehicule);
        if (!camion) {
            return res.status(404).json({
                success: false,
                message: 'Véhicule non trouvé'
            });
        }

        if (kmMaintenance !== undefined && kmMaintenance < camion.kilometrage) {
            return res.status(400).json({
                success: false,
                message: 'Le km de maintenance ne peut pas être inférieur au kilométrage actuel du véhicule'
            });
        }

        if (kmMaintenance !== undefined && prochainKm !== undefined && prochainKm <= kmMaintenance) {
            return res.status(400).json({
                success: false,
                message: 'Le prochain km doit être supérieur au km de maintenance'
            });
        }

        const maintenance = await Maintenance.create({
            vehicule,
            type,
            datePrevu,
            kmMaintenance: kmMaintenance || camion.kilometrage,
            prochainKm,
            cout,
            remarques,
            statut: 'planifiée'
        });

        const maintenancePopulated = await Maintenance.findById(maintenance._id)
            .populate('vehicule', 'matricule marque modele kilometrage');

        res.status(201).json({
            success: true,
            message: 'Maintenance planifiée avec succès',
            data: maintenancePopulated
        });
    } catch (error) {
        next(error);
    }
};

const marquerCommeEffectuee = async (req, res, next) => {
    try {
        const { dateFait, kmMaintenance, cout, remarques, prochainKm } = req.body;

        const maintenance = await Maintenance.findById(req.params.id)
            .populate('vehicule');

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance non trouvée'
            });
        }

        // Vérifier que la maintenance n'est pas déjà effectuée
        if (maintenance.statut === 'effectuée') {
            return res.status(400).json({
                success: false,
                message: 'Cette maintenance est déjà marquée comme effectuée'
            });
        }

        // Mettre à jour les champs
        maintenance.statut = 'effectuée';
        maintenance.dateFait = dateFait || new Date();
        
        if (kmMaintenance !== undefined) {
            maintenance.kmMaintenance = kmMaintenance;
        } else if (!maintenance.kmMaintenance && maintenance.vehicule) {
            maintenance.kmMaintenance = maintenance.vehicule.kilometrage;
        }

        if (cout !== undefined) {
            maintenance.cout = cout;
        }

        if (remarques !== undefined) {
            maintenance.remarques = remarques;
        }

        if (prochainKm !== undefined) {
            maintenance.prochainKm = prochainKm;
        }

        await maintenance.save();

        // Mettre à jour le kilométrage de dernière maintenance du véhicule si nécessaire
        if (maintenance.vehicule && maintenance.kmMaintenance) {
            if (!maintenance.vehicule.derniereMaintenanceKm || 
                maintenance.kmMaintenance > maintenance.vehicule.derniereMaintenanceKm) {
                maintenance.vehicule.derniereMaintenanceKm = maintenance.kmMaintenance;
                await maintenance.vehicule.save();
            }
        }

        const maintenancePopulated = await Maintenance.findById(maintenance._id)
            .populate('vehicule', 'matricule marque modele kilometrage derniereMaintenanceKm');

        res.status(200).json({
            success: true,
            message: 'Maintenance marquée comme effectuée avec succès',
            data: maintenancePopulated
        });
    } catch (error) {
        next(error);
    }
};

const updateMaintenance = async (req, res, next) => {
    try {
        const maintenance = await Maintenance.findById(req.params.id);

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance non trouvée'
            });
        }

        // Ne pas permettre de modifier une maintenance déjà effectuée
        if (maintenance.statut === 'effectuée' && req.body.statut !== 'effectuée') {
            return res.status(400).json({
                success: false,
                message: 'Impossible de modifier une maintenance déjà effectuée'
            });
        }

        const updatedMaintenance = await Maintenance.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
        .populate('vehicule', 'matricule marque modele kilometrage');

        res.status(200).json({
            success: true,
            message: 'Maintenance modifiée avec succès',
            data: updatedMaintenance
        });
    } catch (error) {
        next(error);
    }
};

const deleteMaintenance = async (req, res, next) => {
    try {
        const maintenance = await Maintenance.findById(req.params.id);

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance non trouvée'
            });
        }

        await maintenance.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Maintenance supprimée avec succès'
        });
    } catch (error) {
        next(error);
    }
};

const getMaintenancesAlerte = async (req, res, next) => {
    try {
        const maintenances = await Maintenance.find({
            statut: { $in: ['planifiée', 'en cours'] }
        })
        .populate('vehicule', 'matricule marque modele kilometrage')
        .sort({ datePrevu: 1 });

        const maintenancesAlerte = [];

        for (const maintenance of maintenances) {
            const camion = maintenance.vehicule;
            const dateActuelle = new Date();
            const datePrevu = new Date(maintenance.datePrevu);
            
            let alerte = null;
            let priorite = 'normale';

            // Vérifier échéance par date
            const joursRestants = Math.ceil((datePrevu - dateActuelle) / (1000 * 60 * 60 * 24));
            if (joursRestants < 0) {
                alerte = 'EN RETARD';
                priorite = 'critique';
            } else if (joursRestants <= 7) {
                alerte = 'Échéance proche';
                priorite = 'haute';
            } else if (joursRestants <= 30) {
                alerte = 'À surveiller';
                priorite = 'moyenne';
            }

            // Vérifier échéance par km
            if (maintenance.prochainKm && camion.kilometrage) {
                const kmRestant = maintenance.prochainKm - camion.kilometrage;
                if (kmRestant < 0) {
                    alerte = 'EN RETARD (km)';
                    priorite = 'critique';
                } else if (kmRestant <= 1000 && priorite !== 'critique') {
                    alerte = alerte || 'Échéance proche (km)';
                    priorite = priorite === 'haute' ? 'haute' : 'moyenne';
                }
            }

            if (alerte) {
                maintenancesAlerte.push({
                    id: maintenance._id,
                    type: maintenance.type,
                    vehicule: camion.matricule,
                    datePrevu: maintenance.datePrevu,
                    prochainKm: maintenance.prochainKm,
                    kmActuel: camion.kilometrage,
                    statut: maintenance.statut,
                    alerte,
                    priorite
                });
            }
        }

        res.status(200).json({
            success: true,
            count: maintenancesAlerte.length,
            data: maintenancesAlerte
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllMaintenances,
    getMaintenanceById,
    getMaintenancesByVehicule,
    planifierMaintenance,
    marquerCommeEffectuee,
    updateMaintenance,
    deleteMaintenance,
    getMaintenancesAlerte
};

