/**
 * Classe d'erreur personnalisée pour l'application
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Middleware centralisé de gestion des erreurs
 * Format uniforme pour toutes les réponses d'erreur
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Erreur:', {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode,
            name: err.name
        });
    } else {
        console.error('❌ Erreur:', err.message);
    }

    // Gestion des erreurs Mongoose ValidationError
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            status: 'fail',
            message: 'Erreur de validation',
            errors: errors,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Gestion des erreurs Mongoose Duplicate Key 
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'champ';
        const value = err.keyValue ? Object.values(err.keyValue)[0] : '';
        return res.status(409).json({
            success: false,
            status: 'fail',
            message: `Le ${field} "${value}" existe déjà`,
            field: field,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Gestion des erreurs Mongoose CastError (ID invalide)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            status: 'fail',
            message: `ID invalide: ${err.value}`,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Gestion des erreurs JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            status: 'fail',
            message: 'Token invalide',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            status: 'fail',
            message: 'Token expiré',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Gestion des erreurs Yup 
    if (err.name === 'ValidationError' && err.inner) {
        const errors = err.inner.reduce((acc, validationError) => {
            const path = validationError.path.replace('body.', '').replace('query.', '').replace('params.', '');
            acc[path] = validationError.message;
            return acc;
        }, {});

        return res.status(400).json({
            success: false,
            status: 'fail',
            message: 'Erreur de validation',
            errors: errors,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Gestion des erreurs opérationnelles (AppError)
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    // Erreur de programmation ou erreur inconnue
    // Ne pas exposer les détails en production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Une erreur est survenue sur le serveur' 
        : err.message;

    return res.status(err.statusCode || 500).json({
        success: false,
        status: 'error',
        message: message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    });
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFoundHandler = (req, res, next) => {
    const err = new AppError(`Route ${req.originalUrl} non trouvée`, 404);
    next(err);
};

/**
 * Wrapper async pour éviter les try-catch répétitifs
 * Utilisation: wrapAsync(async (req, res, next) => { ... })
 */
const wrapAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    AppError,
    wrapAsync
};

