const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Récupérer la liste des utilisateurs
 */
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll();
        res.json({ data: users });
    } catch (error) {
        logger.error('Erreur lors de la récupération des utilisateurs:', error);
        next(error);
    }
};

/**
 * Créer un nouvel utilisateur
 */
exports.createUser = async (req, res, next) => {
    try {
        const { username, password, display_name, email, role } = req.body;

        // Hash du mot de passe
        const password_hash = await bcrypt.hash(password, 10);

        // Création de l'utilisateur
        const newUser = await User.create({
            username,
            password_hash,
            display_name,
            email,
            role
        });

        res.status(201).json(newUser);
    } catch (error) {
        logger.error('Erreur lors de la création de l\'utilisateur:', error);
        next(error);
    }
};
