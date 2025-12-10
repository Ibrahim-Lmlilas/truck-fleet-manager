const express = require('express');
const router = express.Router();
const { getAllMaintenances, getMaintenanceById, getMaintenancesByVehicule, planifierMaintenance, calculerEcheances, marquerCommeEffectuee, updateMaintenance, deleteMaintenance, getMaintenancesAlerte } = require('../controllers/maintenance.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');
const { validate, maintenanceSchema, marquerEffectueeSchema } = require('../middlewares/validation.middleware');

router.use(protect);

router.get('/alertes', isAdmin, getMaintenancesAlerte);
router.get('/vehicule/:vehiculeId', isAdmin, getMaintenancesByVehicule);
router.get('/vehicule/:vehiculeId/echeances', isAdmin, calculerEcheances);
router.get('/', isAdmin, getAllMaintenances);
router.get('/:id', isAdmin, getMaintenanceById);
router.post('/', isAdmin, validate(maintenanceSchema), planifierMaintenance);
router.put('/:id', isAdmin, validate(maintenanceSchema), updateMaintenance);
router.patch('/:id/effectuee', isAdmin, validate(marquerEffectueeSchema), marquerCommeEffectuee);
router.delete('/:id', isAdmin, deleteMaintenance);

module.exports = router;

