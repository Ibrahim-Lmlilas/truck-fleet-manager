const Camion = require('../models/Camion.model');


const getAllCamions = async (req, res, next) => {

    try {
        const camions = await Camion.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: camions.length,
            data: camions
        });
    }
    catch (error) {
        next(error);
    }
}


const getCamionById = async (req, res, next) => {
    try {
        const camion = await Camion.findById(req.params.id);

        if (!camion) {
            return res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: camion
        });
    } catch (error) {
        next(error);
    }
};

const createCamion = async (req, res, next) => {
    try {
        const camion = await Camion.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Camion créé avec succès',
            data: camion
        });
    } catch (error) {
        next(error);
    }
};

const updateCamion = async (req, res, next) => {
    try {
        const camion = await Camion.findById(req.params.id);

        if (!camion) {
            return res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            });
        }

        const updatedCamion = await Camion.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Camion modifié avec succès',
            data: updatedCamion
        });
    } catch (error) {
        next(error);
    }
};

const deleteCamion = async (req, res, next) => {
    try {
        const camion = await Camion.findById(req.params.id);

        if (!camion) {
            return res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            });
        }

        await camion.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Camion supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

const updateKilometrage = async (req, res, next) => {
    try {
        const { kilometrage } = req.body;

        if (!kilometrage || kilometrage < 0) {
            return res.status(400).json({
                success: false,
                message: 'Kilométrage invalide'
            });
        }

        const camion = await Camion.findById(req.params.id);

        if (!camion) {
            return res.status(404).json({
                success: false,
                message: 'Camion non trouvé'
            });
        }

        if (kilometrage < camion.kilometrage) {
            return res.status(400).json({
                success: false,
                message: 'Le nouveau kilométrage doit être supérieur à l\'ancien'
            });
        }

        camion.kilometrage = kilometrage;
        await camion.save();

        res.status(200).json({
            success: true,
            message: 'Kilométrage mis à jour',
            data: camion
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllCamions,
    getCamionById,
    createCamion,
    updateCamion,
    deleteCamion,
    updateKilometrage
};