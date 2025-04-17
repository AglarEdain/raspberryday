const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const auth = require('../middleware/auth');
const { validateUserCreation } = require('../middleware/validators/users.validator');

/**
 * @route GET /api/users
 * @desc Récupérer la liste des utilisateurs
 * @access Private
 */
router.get('/', auth, usersController.getUsers);

/**
 * @route POST /api/users
 * @desc Créer un nouvel utilisateur
 * @access Private
 */
router.post('/', auth, validateUserCreation, usersController.createUser);

module.exports = router;
