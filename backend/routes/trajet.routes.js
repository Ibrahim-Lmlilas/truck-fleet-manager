const express = require('express');
const router = express.Router();
const { getAllTrajets, getTrajetById, createTrajet, updateTrajet, updateStatut, updateKmEtGasoil, deleteTrajet, generatePDF } = require('../controllers/trajet.controller');
const { protect, isAdmin, authorize } = require('../middlewares/auth.middleware');
const { validate, trajetSchema, updateStatutSchema, updateKmEtGasoilSchema } = require('../middlewares/validation.middleware');

router.use(protect);

router.get('/', getAllTrajets);
router.get('/:id/pdf', authorize('admin', 'chauffeur'), generatePDF);
router.get('/:id', getTrajetById);
router.post('/', isAdmin, validate(trajetSchema), createTrajet);
router.put('/:id', isAdmin, validate(trajetSchema), updateTrajet);
router.patch('/:id/statut', authorize('admin', 'chauffeur'), validate(updateStatutSchema), updateStatut);
router.patch('/:id/km-gasoil', authorize('admin', 'chauffeur'), validate(updateKmEtGasoilSchema), updateKmEtGasoil);
router.delete('/:id', isAdmin, deleteTrajet);

module.exports = router;

