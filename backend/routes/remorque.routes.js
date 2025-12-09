const express = require('express');
const router = express.Router();
const { getAllRemorques, getRemorqueById, createRemorque, updateRemorque, deleteRemorque } = require('../controllers/remorque.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');
const { validate, remorqueSchema } = require('../middlewares/validation.middleware');

router.use(protect);


router.get('/', isAdmin, getAllRemorques);
router.get('/:id', isAdmin, getRemorqueById);
router.post('/', isAdmin, validate(remorqueSchema), createRemorque);
router.put('/:id', isAdmin, validate(remorqueSchema), updateRemorque);
router.delete('/:id', isAdmin, deleteRemorque);

module.exports = router;
