const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const TokenBlacklist = require('../models/TokenBlacklist.model');

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé - Token manquant'
            });
        }
        try {
            // Vérifier si le token est blacklisté
            const isBlacklisted = await TokenBlacklist.findOne({ token });
            if (isBlacklisted) {
                return res.status(401).json({
                    success: false,
                    message: 'Token invalide - Veuillez vous reconnecter'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Compte désactivé'
                });
            }
            req.user = user;
            req.token = token; // Sauvegarder le token pour l'utiliser dans logout
            next();
        } catch (error) {
            // Token invalide ou expiré
            return res.status(401).json({
                success: false,
                message: 'Token invalide ou expiré'
            });
        }

    } catch (error) {
        console.error('Erreur middleware protect:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Non authentifié'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Accès refusé - Rôle ${req.user.role} non autorisé pour cette route`
            });
        }

        next();
    };
};

const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Non authentifié'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé - Admin seulement'
        });
    }

    next();
};

const isChauffeur = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Non authentifié'
        });
    }

    if (req.user.role !== 'chauffeur') {
        return res.status(403).json({
            success: false,
            message: 'Accès refusé - Chauffeur seulement'
        });
    }

    next();
};

module.exports = {
  protect,
  authorize,
  isAdmin,
  isChauffeur
};