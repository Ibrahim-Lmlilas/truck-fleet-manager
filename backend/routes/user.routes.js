const express = require('express');
const router = express.Router();
const { getAllUsers, getAllChauffeurs, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(isAdmin);

router.get('/chauffeurs', getAllChauffeurs);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

