const express = require('express');
const router = express.Router();
const { getAllPneus, getPneuById, getPneusByCamion, createPneu, updatePneu, deletePneu, calculerUsure, getPneusAlertes, remplacerPneu } = require('../controllers/pneu.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');
const { validate, pneuSchema, remplacerPneuSchema } = require('../middlewares/validation.middleware');

router.use(protect);

router.get('/alertes', isAdmin, getPneusAlertes);
router.get('/', isAdmin, getAllPneus);
router.get('/camion/:camionId', isAdmin, getPneusByCamion);
router.get('/:id', isAdmin, getPneuById);
router.get('/:id/usure', isAdmin, calculerUsure);
router.post('/', isAdmin, validate(pneuSchema), createPneu);
router.post('/:id/remplacer', isAdmin, validate(remplacerPneuSchema), remplacerPneu);
router.put('/:id', isAdmin, validate(pneuSchema), updatePneu);
router.delete('/:id', isAdmin, deletePneu);

module.exports = router;
