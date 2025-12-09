const Pneu = require('../models/Pneu.model');
const Camion = require('../models/Camion.model');

const getAllPneus = async (req, res, next) => {
    try {
        const pneus = await Pneu.find()
            .populate('camion', 'matricule marque modele')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pneus.length,
            data: pneus
        });
    } catch (error) {
        next(error);
    }
};

const getPneuById = async (req, res, next) => {
    try {
        const pneu = await Pneu.findById(req.params.id)
            .populate('camion', 'matricule marque modele kilometrage');

        if (!pneu) {
            return res.status(404).json({
                success: false,
                message: 'Pneu non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: pneu
        });
    } catch (error) {
        next(error);
    }
};

const getPneusByCamion = async (req, res, next) => {
    try {
        const pneus = await Pneu.find({ camion: req.params.camionId })
            .populate('camion', 'matricule marque modele kilometrage')
            .sort({ position: 1 });

        res.status(200).json({
            success: true,
            count: pneus.length,
            data: pneus
        });
    } catch (error) {
        next(error);
    }
};

const createPneu = async (req, res, next) => {
    try {
        // Vérifier si le camion existe
        const camion = await Camion.findById(req.body.camion);
        if (!camion) {
            return res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            });
        }

        // Vérifier si la position est déjà occupée
        const existingPneu = await Pneu.findOne({
            camion: req.body.camion,
            position: req.body.position,
            statut: { $ne: 'remplacé' }
        });

        if (existingPneu) {
            return res.status(400).json({
                success: false,
                message: `La position ${req.body.position} est déjà occupée`
            });
        }

        const pneu = await Pneu.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Pneu créé avec succès',
            data: pneu
        });
    } catch (error) {
        next(error);
    }
};

const updatePneu = async (req, res, next) => {
    try {
        const pneu = await Pneu.findById(req.params.id);

        if (!pneu) {
            return res.status(404).json({
                success: false,
                message: 'Pneu non trouvé'
            });
        }

        const updatedPneu = await Pneu.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('camion', 'matricule marque modele kilometrage');

        res.status(200).json({
            success: true,
            message: 'Pneu modifié avec succès',
            data: updatedPneu
        });
    } catch (error) {
        next(error);
    }
};

const deletePneu = async (req, res, next) => {
    try {
        const pneu = await Pneu.findById(req.params.id);

        if (!pneu) {
            return res.status(404).json({
                success: false,
                message: 'Pneu non trouvé'
            });
        }

        await pneu.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Pneu supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};


const calculerUsure = async (req, res, next) => {
    try {
        const pneu = await Pneu.findById(req.params.id)
            .populate('camion', 'matricule marque modele kilometrage');

        if (!pneu) {
            return res.status(404).json({
                success: false,
                message: 'Pneu non trouvé'
            });
        }

        const kmActuel = pneu.camion.kilometrage;
        const kmParcouru = kmActuel - pneu.kmPose;
        const kmRestant = pneu.kmMax - kmActuel;
        const usurePercentage = Math.min(100, Math.round((kmParcouru / (pneu.kmMax - pneu.kmPose)) * 100));

        // Déterminer le statut selon l'usure
        let nouveauStatut = pneu.statut;
        let alerte = null;

        if (usurePercentage >= 100) {
            nouveauStatut = 'à remplacer';
            alerte = 'CRITIQUE - Pneu à remplacer immédiatement';
        } else if (usurePercentage >= 80) {
            nouveauStatut = 'usé';
            alerte = 'ATTENTION - Pneu usé, remplacement à prévoir';
        } else if (usurePercentage >= 60) {
            alerte = 'INFO - Pneu à surveiller';
        }

        // Mettre à jour le statut si changé
        if (nouveauStatut !== pneu.statut) {
            pneu.statut = nouveauStatut;
            await pneu.save();
        }

        res.status(200).json({
            success: true,
            data: {
                pneu: {
                    id: pneu._id,
                    reference: pneu.reference,
                    position: pneu.position,
                    statut: nouveauStatut
                },
                camion: {
                    matricule: pneu.camion.matricule,
                    kilometrageActuel: kmActuel
                },
                usure: {
                    kmPose: pneu.kmPose,
                    kmMax: pneu.kmMax,
                    kmParcouru,
                    kmRestant: Math.max(0, kmRestant),
                    pourcentageUsure: usurePercentage
                },
                alerte
            }
        });
    } catch (error) {
        next(error);
    }
};


const getPneusAlertes = async (req, res, next) => {
    try {
        const pneus = await Pneu.find({
            statut: { $in: ['usé', 'à remplacer'] }
        })
        .populate('camion', 'matricule marque modele kilometrage')
        .sort({ statut: -1 });

        const alertes = pneus.map(pneu => {
            const kmActuel = pneu.camion.kilometrage;
            const kmParcouru = kmActuel - pneu.kmPose;
            const kmRestant = pneu.kmMax - kmActuel;
            const usurePercentage = Math.min(100, Math.round((kmParcouru / (pneu.kmMax - pneu.kmPose)) * 100));

            return {
                id: pneu._id,
                reference: pneu.reference,
                camion: pneu.camion.matricule,
                position: pneu.position,
                statut: pneu.statut,
                usurePercentage,
                kmRestant: Math.max(0, kmRestant),
                priorite: usurePercentage >= 100 ? 'CRITIQUE' : usurePercentage >= 80 ? 'HAUTE' : 'MOYENNE'
            };
        });

        res.status(200).json({
            success: true,
            count: alertes.length,
            data: alertes
        });
    } catch (error) {
        next(error);
    }
};


const remplacerPneu = async (req, res, next) => {
    try {
        const { nouveauPneu } = req.body; // { reference, kmPose, prix }

        const ancienPneu = await Pneu.findById(req.params.id)
            .populate('camion');

        if (!ancienPneu) {
            return res.status(404).json({
                success: false,
                message: 'Pneu non trouvé'
            });
        }

        // Marquer l'ancien pneu comme remplacé
        ancienPneu.statut = 'remplacé';
        ancienPneu.dateRemplacement = new Date();
        await ancienPneu.save();

        // Créer le nouveau pneu
        const pneuCree = await Pneu.create({
            reference: nouveauPneu.reference,
            camion: ancienPneu.camion._id,
            position: ancienPneu.position,
            kmPose: nouveauPneu.kmPose || ancienPneu.camion.kilometrage,
            kmMax: nouveauPneu.kmMax || 80000,
            prix: nouveauPneu.prix,
            statut: 'bon'
        });

        res.status(201).json({
            success: true,
            message: 'Pneu remplacé avec succès',
            data: {
                ancienPneu,
                nouveauPneu: pneuCree
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPneus,
    getPneuById,
    getPneusByCamion,
    createPneu,
    updatePneu,
    deletePneu,
    calculerUsure,
    getPneusAlertes,
    remplacerPneu
};