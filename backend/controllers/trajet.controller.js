const Trajet = require('../models/Trajet.model');
const Camion = require('../models/Camion.model');
const Remorque = require('../models/Remorque.model');
const User = require('../models/User.model');
const { generateOrdreMissionPDF } = require('../services/pdf.service');

const getAllTrajets = async (req, res, next) => {
    try {
        let trajets;

        if (req.user.role === 'admin') {
            trajets = await Trajet.find()
                .populate('chauffeur', 'nom prenom email')
                .populate('camion', 'matricule marque modele')
                .populate('remorque', 'matricule type capacite')
                .sort({ dateDepart: -1 });
        } else {
            trajets = await Trajet.find({ chauffeur: req.user._id })
                .populate('chauffeur', 'nom prenom email')
                .populate('camion', 'matricule marque modele')
                .populate('remorque', 'matricule type capacite')
                .sort({ dateDepart: -1 });
        }

        res.status(200).json({
            success: true,
            count: trajets.length,
            data: trajets
        });
    } catch (error) {
        next(error);
    }
};

const getTrajetById = async (req, res, next) => {
    try {
        const trajet = await Trajet.findById(req.params.id)
            .populate('chauffeur', 'nom prenom email')
            .populate('camion', 'matricule marque modele kilometrage')
            .populate('remorque', 'matricule type capacite');

        if (!trajet) {
            return res.status(404).json({
                success: false,
                message: 'Trajet non trouvé'
            });
        }

        if (req.user.role === 'chauffeur' && trajet.chauffeur._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Vous ne pouvez voir que vos propres trajets'
            });
        }

        res.status(200).json({
            success: true,
            data: trajet
        });
    } catch (error) {
        next(error);
    }
};

const createTrajet = async (req, res, next) => {
    try {
        const chauffeur = await User.findById(req.body.chauffeur);
        if (!chauffeur) {
            return res.status(404).json({
                success: false,
                message: 'Chauffeur non trouvé'
            });
        }

        if (chauffeur.role !== 'chauffeur') {
            return res.status(400).json({
                success: false,
                message: 'L\'utilisateur sélectionné n\'est pas un chauffeur'
            });
        }

        // Vérifier si le camion existe
        const camion = await Camion.findById(req.body.camion);
        if (!camion) {
            return res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            });
        }

        // Vérifier si la remorque existe (si fournie)
        if (req.body.remorque) {
            const remorque = await Remorque.findById(req.body.remorque);
            if (!remorque) {
                return res.status(404).json({
                    success: false,
                    message: 'Remorque non trouvée'
                });
            }
        }

        // Vérifier que la date d'arrivée est après la date de départ
        if (new Date(req.body.dateArrivee) <= new Date(req.body.dateDepart)) {
            return res.status(400).json({
                success: false,
                message: 'La date d\'arrivée doit être postérieure à la date de départ'
            });
        }

        const trajet = await Trajet.create(req.body);

        // Populate pour la réponse
        const trajetPopulated = await Trajet.findById(trajet._id)
            .populate('chauffeur', 'nom prenom email')
            .populate('camion', 'matricule marque modele')
            .populate('remorque', 'matricule type capacite');

        res.status(201).json({
            success: true,
            message: 'Trajet créé avec succès',
            data: trajetPopulated
        });
    } catch (error) {
        next(error);
    }
};

const updateTrajet = async (req, res, next) => {
    try {
        const trajet = await Trajet.findById(req.params.id);

        if (!trajet) {
            return res.status(404).json({
                success: false,
                message: 'Trajet non trouvé'
            });
        }

        if (req.user.role === 'chauffeur' && trajet.chauffeur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Vous ne pouvez modifier que vos propres trajets'
            });
        }

        const updatedTrajet = await Trajet.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
        .populate('chauffeur', 'nom prenom email')
        .populate('camion', 'matricule marque modele')
        .populate('remorque', 'matricule type capacite');

        res.status(200).json({
            success: true,
            message: 'Trajet modifié avec succès',
            data: updatedTrajet
        });
    } catch (error) {
        next(error);
    }
};

const updateStatut = async (req, res, next) => {
    try {
        const { statut } = req.body;

        if (!statut) {
            return res.status(400).json({
                success: false,
                message: 'Le statut est obligatoire'
            });
        }

        const statutsValides = ['à faire', 'en cours', 'terminé', 'annulé'];
        if (!statutsValides.includes(statut)) {
            return res.status(400).json({
                success: false,
                message: `Statut invalide. Statuts valides: ${statutsValides.join(', ')}`
            });
        }

        const trajet = await Trajet.findById(req.params.id);

        if (!trajet) {
            return res.status(404).json({
                success: false,
                message: 'Trajet non trouvé'
            });
        }

        if (req.user.role !== 'admin' && trajet.chauffeur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Vous ne pouvez modifier que vos propres trajets'
            });
        }

        trajet.statut = statut;
        await trajet.save();

        const trajetPopulated = await Trajet.findById(trajet._id)
            .populate('chauffeur', 'nom prenom email')
            .populate('camion', 'matricule marque modele')
            .populate('remorque', 'matricule type capacite');

        res.status(200).json({
            success: true,
            message: 'Statut mis à jour avec succès',
            data: trajetPopulated
        });
    } catch (error) {
        next(error);
    }
};

const updateKmEtGasoil = async (req, res, next) => {
    try {
        const { kmDepart, kmArrivee, gasoilConsomme } = req.body;

        const trajet = await Trajet.findById(req.params.id);

        if (!trajet) {
            return res.status(404).json({
                success: false,
                message: 'Trajet non trouvé'
            });
        }

        if (req.user.role !== 'admin' && trajet.chauffeur.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Vous ne pouvez modifier que vos propres trajets'
            });
        }

        if (kmDepart !== undefined) {
            if (kmDepart < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Le km départ doit être positif'
                });
            }
            trajet.kmDepart = kmDepart;
        }

        if (kmArrivee !== undefined) {
            if (kmArrivee < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Le km arrivée doit être positif'
                });
            }
            
            const kmDepartValue = kmDepart !== undefined ? kmDepart : trajet.kmDepart;
            if (kmDepartValue && kmArrivee < kmDepartValue) {
                return res.status(400).json({
                    success: false,
                    message: 'Le km arrivée doit être supérieur ou égal au km départ'
                });
            }
            trajet.kmArrivee = kmArrivee;
        }

        if (gasoilConsomme !== undefined) {
            if (gasoilConsomme < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Le gasoil consommé doit être positif'
                });
            }
            trajet.gasoilConsomme = gasoilConsomme;
        }

        await trajet.save();

        const trajetPopulated = await Trajet.findById(trajet._id)
            .populate('chauffeur', 'nom prenom email')
            .populate('camion', 'matricule marque modele kilometrage')
            .populate('remorque', 'matricule type capacite');

        res.status(200).json({
            success: true,
            message: 'Kilomètres et gasoil mis à jour avec succès',
            data: trajetPopulated
        });
    } catch (error) {
        next(error);
    }
};

const deleteTrajet = async (req, res, next) => {
    try {
        const trajet = await Trajet.findById(req.params.id);

        if (!trajet) {
            return res.status(404).json({
                success: false,
                message: 'Trajet non trouvé'
            });
        }

        await trajet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Trajet supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

const generatePDF = async (req, res, next) => {
    try {
        const trajet = await Trajet.findById(req.params.id)
            .populate('chauffeur', 'nom prenom email')
            .populate('camion', 'matricule marque modele kilometrage')
            .populate('remorque', 'matricule type capacite');

        if (!trajet) {
            return res.status(404).json({
                success: false,
                message: 'Trajet non trouvé'
            });
        }

        // Chauffeur ne peut générer que ses propres PDFs
        if (req.user.role === 'chauffeur' && trajet.chauffeur._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Vous ne pouvez générer que les PDFs de vos propres trajets'
            });
        }

        // Générer le PDF
        const pdfBuffer = await generateOrdreMissionPDF(trajet);

        // Définir les headers pour le téléchargement
        const fileName = `ordre_mission_${trajet._id.toString().substring(0, 8)}_${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Envoyer le PDF
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTrajets,
    getTrajetById,
    createTrajet,
    updateTrajet,
    updateStatut,
    updateKmEtGasoil,
    deleteTrajet,
    generatePDF
};

