const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateLogin, validateRegister } = require('../middleware/validators/auth.validator');

/**
 * @route POST /api/auth/login
 * @desc Authentification d'un utilisateur
 * @access Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route POST /api/auth/register
 * @desc Inscription d'un nouvel utilisateur
 * @access Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route GET /api/auth/verify
 * @desc Vérification du token JWT
 * @access Private
 */
router.get('/verify', authController.verifyToken);

module.exports = router;