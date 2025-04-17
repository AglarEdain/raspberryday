const Category = require('../models/category.model');
const logger = require('../utils/logger');

/**
 * Récupérer la liste des catégories
 */
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        res.json({ data: categories });
    } catch (error) {
        logger.error('Erreur lors de la récupération des catégories:', error);
        next(error);
    }
};

/**
 * Créer une nouvelle catégorie
 */
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const newCategory = await Category.create({ name, description });
        res.status(201).json(newCategory);
    } catch (error) {
        logger.error('Erreur lors de la création de la catégorie:', error);
        next(error);
    }
};
