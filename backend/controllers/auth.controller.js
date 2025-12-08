const User = require('../models/User.model');
const jwt = require('jsonwebtoken');


class AuthController {


    generateToken(userId) {
        return jwt.sign(
            { id: userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
    }

    register = async (req, res) => {

        try {
            const { nom, prenom, email, password, role } = req.body;

            if (!nom || !prenom || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Tous les champs sont obligatoires'
                });
            }

            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Cet email est déjà utilisé'
                });
            }

            if (role && !['admin', 'chauffeur'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rôle invalide'
                });
            }

            const user = await User.create({
                nom,
                prenom,
                email: email.toLowerCase(),
                password,
                role: role || 'chauffeur'
            });

            const token = this.generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'Inscription réussie',
                data: {
                    user: {
                        id: user._id,
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Erreur register:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'inscription',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email et mot de passe sont obligatoires'
                });
            }

            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Votre compte est désactivé'
                });
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Email ou mot de passe incorrect'
                });
            }

            const token = this.generateToken(user._id);

            res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: {
                        id: user._id,
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        role: user.role
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Erreur login:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la connexion',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    logout = async (req, res) => {
        try {
            res.status(200).json({
                success: true,
                message: 'Déconnexion réussie'
            });
        }
        catch (error) {
            console.error('Erreur logout:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la déconnexion'
            });
        }
    }

    async getMe(req, res) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        role: user.role,
                        isActive: user.isActive
                    }
                }
            });

        } catch (error) {
            console.error('Erreur getMe:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération du profil'
            });
        }
    }

}

module.exports = new AuthController();