const express = require('express');
const router = express.Router();
const { getAllCamions,getCamionById,createCamion,updateCamion,deleteCamion,updateKilometrage} = require('../controllers/camion.controller');
const { protect, isAdmin, authorize } = require('../middlewares/auth.middleware');
const { validate, camionSchema, updateKilometrageSchema } = require('../middlewares/validation.middleware');


// Toutes les routes nécessitent authentification
router.use(protect);

router.get('/', isAdmin, getAllCamions);
router.get('/:id', isAdmin, getCamionById);
router.post('/', isAdmin, validate(camionSchema), createCamion);
router.put('/:id', isAdmin, validate(camionSchema), updateCamion);
router.delete('/:id', isAdmin, deleteCamion);

// PATCH /api/camions/:id/kilometrage - Admin OU Chauffeur + validation
router.patch('/:id/kilometrage',authorize('admin', 'chauffeur'),validate(updateKilometrageSchema),updateKilometrage);


module.exports = router;