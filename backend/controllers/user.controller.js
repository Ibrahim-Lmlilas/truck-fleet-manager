const User = require('../models/User.model');

const getAllUsers = async (req, res, next) => {
    try {
        // Récupérer tous les utilisateurs (sans le mot de passe)
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

const getAllChauffeurs = async (req, res, next) => {
    try {
        // Récupérer seulement les chauffeurs
        const chauffeurs = await User.find({ role: 'chauffeur' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: chauffeurs.length,
            data: chauffeurs
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { nom, prenom, email, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier si l'email existe déjà (sauf pour cet utilisateur)
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Cet email est déjà utilisé'
                });
            }
            user.email = email.toLowerCase();
        }

        if (nom) user.nom = nom;
        if (prenom) user.prenom = prenom;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        const userResponse = await User.findById(user._id).select('-password');

        res.status(200).json({
            success: true,
            message: 'Utilisateur modifié avec succès',
            data: userResponse
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Empêcher la suppression de l'utilisateur actuel
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Vous ne pouvez pas supprimer votre propre compte'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Utilisateur supprimé avec succès'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllUsers,
    getAllChauffeurs,
    getUserById,
    updateUser,
    deleteUser
};

