const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const auth = require('../middleware/auth');
const { validateCategoryCreation } = require('../middleware/validators/categories.validator');

/**
 * @route GET /api/categories
 * @desc Récupérer la liste des catégories
 * @access Private
 */
router.get('/', auth, categoriesController.getCategories);

/**
 * @route POST /api/categories
 * @desc Créer une nouvelle catégorie
 * @access Private
 */
router.post('/', auth, validateCategoryCreation, categoriesController.createCategory);

module.exports = router;
