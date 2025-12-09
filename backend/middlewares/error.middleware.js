const errorHandler = (err, req, res, next) => {
    console.error('Erreur:', err);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} existe déjà`
        });
    }

    // Erreur CastError (ID invalide)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'ID invalide'
        });
    }

    // Erreur par défaut
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Erreur serveur'
    });
};

module.exports = errorHandler;