const Remorque = require('../models/Remorque.model');

const getAllRemorques = async (req, res, next) => {
    try {
        const remorques = await Remorque.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: remorques.length,
            data: remorques
        });
    } catch (error) {
        next(error);
    }
};

const getRemorqueById = async (req, res, next) => {
    try {
        const remorque = await Remorque.findById(req.params.id);

        if (!remorque) {
            return res.status(404).json({
                success: false,
                message: 'Remorque non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: remorque
        });
    } catch (error) {
        next(error);
    }
};

const createRemorque = async (req, res, next) => {
    try {
        const remorque = await Remorque.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Remorque créée avec succès',
            data: remorque
        });
    } catch (error) {
        next(error);
    }
};

const updateRemorque = async (req, res, next) => {
    try {
        const remorque = await Remorque.findById(req.params.id);

        if (!remorque) {
            return res.status(404).json({
                success: false,
                message: 'Remorque non trouvée'
            });
        }

        const updatedRemorque = await Remorque.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Remorque modifiée avec succès',
            data: updatedRemorque
        });
    } catch (error) {
        next(error);
    }
};

const deleteRemorque = async (req, res, next) => {
    try {
        const remorque = await Remorque.findById(req.params.id);

        if (!remorque) {
            return res.status(404).json({
                success: false,
                message: 'Remorque non trouvée'
            });
        }

        await remorque.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Remorque supprimée avec succès'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRemorques,
    getRemorqueById,
    createRemorque,
    updateRemorque,
    deleteRemorque
};