const yup = require('yup');

const registerSchema = yup.object({
    body: yup.object({
        nom: yup.string()
            .required('Le nom est obligatoire')
            .min(2, 'Le nom doit contenir au moins 2 caractères')
            .max(50, 'Le nom ne peut pas dépasser 50 caractères')
            .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres'),

        prenom: yup.string()
            .required('Le prénom est obligatoire')
            .min(2, 'Le prénom doit contenir au moins 2 caractères')
            .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
            .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres'),

        email: yup.string()
            .required('L\'email est obligatoire')
            .email('L\'email n\'est pas valide')
            .lowercase()
            .max(100, 'L\'email ne peut pas dépasser 100 caractères'),

        password: yup.string()
            .required('Le mot de passe est obligatoire')
            .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
            .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
            ),

        role: yup.string()
            .oneOf(['admin', 'chauffeur'], 'Le rôle doit être admin ou chauffeur')
            .default('chauffeur')
    })
});

const loginSchema = yup.object({
    body: yup.object({
        email: yup.string()
            .required('L\'email est obligatoire')
            .email('L\'email n\'est pas valide')
            .lowercase(),

        password: yup.string()
            .required('Le mot de passe est obligatoire')
    })
});

const camionSchema = yup.object({
    body: yup.object({
        matricule: yup.string()
            .required('Le matricule est obligatoire')
            .min(3, 'Le matricule doit contenir au moins 3 caractères')
            .max(20, 'Le matricule ne peut pas dépasser 20 caractères')
            .matches(/^[A-Z0-9-]+$/, 'Le matricule doit contenir uniquement des lettres majuscules, chiffres et tirets'),

        marque: yup.string()
            .required('La marque est obligatoire')
            .min(2, 'La marque doit contenir au moins 2 caractères')
            .max(50, 'La marque ne peut pas dépasser 50 caractères'),

        modele: yup.string()
            .required('Le modèle est obligatoire')
            .min(2, 'Le modèle doit contenir au moins 2 caractères')
            .max(50, 'Le modèle ne peut pas dépasser 50 caractères'),

        annee: yup.number()
            .required('L\'année est obligatoire')
            .integer('L\'année doit être un nombre entier')
            .min(1900, 'L\'année doit être supérieure à 1900')
            .max(new Date().getFullYear() + 1, `L'année ne peut pas dépasser ${new Date().getFullYear() + 1}`),

        kilometrage: yup.number()
            .required('Le kilométrage est obligatoire')
            .integer('Le kilométrage doit être un nombre entier')
            .min(0, 'Le kilométrage doit être positif'),

        statut: yup.string()
            .oneOf(
                ['disponible', 'en_route', 'en_maintenance', 'hors_service'],
                'Statut invalide'
            )
            .default('disponible')
    })
});

const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate({
            body: req.body,
            query: req.query,
            params: req.params
        }, {
            abortEarly: false
        });

        next();
    } catch (error) {
        const errors = error.inner.reduce((acc, err) => {
            const path = err.path.replace('body.', '');
            acc[path] = err.message;
            return acc;
        }, {});

        return res.status(400).json({
            success: false,
            message: 'Erreur de validation',
            errors: errors
        });
    }
};

const updateKilometrageSchema = yup.object({
    body: yup.object({
        kilometrage: yup.number()
            .required('Le kilométrage est obligatoire')
            .integer('Le kilométrage doit être un nombre entier')
            .min(0, 'Le kilométrage doit être positif')
    })
});

const remorqueSchema = yup.object({
    body: yup.object({
        matricule: yup.string()
            .required('Le matricule est obligatoire')
            .min(3, 'Le matricule doit contenir au moins 3 caractères')
            .max(20, 'Le matricule ne peut pas dépasser 20 caractères')
            .matches(/^[A-Z0-9-]+$/, 'Le matricule doit contenir uniquement des lettres majuscules, chiffres et tirets'),

        type: yup.string()
            .required('Le type est obligatoire')
            .min(2, 'Le type doit contenir au moins 2 caractères')
            .max(50, 'Le type ne peut pas dépasser 50 caractères'),

        capacite: yup.number()
            .required('La capacité est obligatoire')
            .positive('La capacité doit être positive')
            .min(1, 'La capacité doit être au moins 1 tonne'),

        statut: yup.string()
            .oneOf(
                ['disponible', 'en mission', 'en panne', 'en maintenance'],
                'Statut invalide'
            )
            .default('disponible'),

        remarques: yup.string()
            .max(500, 'Les remarques ne peuvent pas dépasser 500 caractères')
    })
});

const pneuSchema = yup.object({
    body: yup.object({
        reference: yup.string()
            .required('La référence est obligatoire')
            .min(3, 'La référence doit contenir au moins 3 caractères')
            .max(50, 'La référence ne peut pas dépasser 50 caractères'),

        camion: yup.string()
            .required('Le camion est obligatoire')
            .matches(/^[0-9a-fA-F]{24}$/, 'ID camion invalide'),

        kmPose: yup.number()
            .required('Le kilométrage de pose est obligatoire')
            .integer('Le kilométrage doit être un nombre entier')
            .min(0, 'Le kilométrage doit être positif'),

        kmMax: yup.number()
            .required('Le kilométrage maximum est obligatoire')
            .integer('Le kilométrage doit être un nombre entier')
            .min(1000, 'Le kilométrage maximum doit être au moins 1000 km')
            .test('kmMax-greater', 'Le kilométrage maximum doit être supérieur au kilométrage de pose', 
                function(value) {
                    const { kmPose } = this.parent;
                    return value > kmPose;
                }
            ),

        prix: yup.number()
            .positive('Le prix doit être positif')
            .min(0, 'Le prix doit être positif'),

        statut: yup.string()
            .oneOf(
                ['bon', 'usé', 'à remplacer', 'remplacé'],
                'Statut invalide'
            )
            .default('bon')
    })
});

const remplacerPneuSchema = yup.object({
    body: yup.object({
        nouveauPneu: yup.object({
            reference: yup.string()
                .required('La référence du nouveau pneu est obligatoire')
                .min(3, 'La référence doit contenir au moins 3 caractères')
                .max(50, 'La référence ne peut pas dépasser 50 caractères'),

            kmPose: yup.number()
                .integer('Le kilométrage doit être un nombre entier')
                .min(0, 'Le kilométrage doit être positif'),

            kmMax: yup.number()
                .integer('Le kilométrage doit être un nombre entier')
                .min(1000, 'Le kilométrage maximum doit être au moins 1000 km')
                .default(80000),

            prix: yup.number()
                .positive('Le prix doit être positif')
                .min(0, 'Le prix doit être positif')
        }).required('Les informations du nouveau pneu sont obligatoires')
    })
});

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    camionSchema,
    updateKilometrageSchema,
    remorqueSchema,
    pneuSchema,
    remplacerPneuSchema
};
