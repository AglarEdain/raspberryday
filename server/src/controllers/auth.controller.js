const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Authentification d'un utilisateur
 */
exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Recherche de l'utilisateur
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                error: {
                    message: 'Nom d\'utilisateur ou mot de passe incorrect'
                }
            });
        }

        // Vérification du mot de passe
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                error: {
                    message: 'Nom d\'utilisateur ou mot de passe incorrect'
                }
            });
        }

        // Génération du token JWT
        const token = jwt.sign(
            { 
                id: user.id,
                username: user.username,
                role: user.role 
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Réponse avec le token et les informations de l'utilisateur
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                role: user.role
            }
        });

    } catch (error) {
        logger.error('Erreur lors de la connexion:', error);
        next(error);
    }
};

/**
 * Inscription d'un nouvel utilisateur
 */
exports.register = async (req, res, next) => {
    try {
        const { username, password, email, display_name } = req.body;

        // Vérification si l'utilisateur existe déjà
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({
                error: {
                    message: 'Ce nom d\'utilisateur est déjà utilisé'
                }
            });
        }

        // Vérification si l'email existe déjà
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                error: {
                    message: 'Cette adresse email est déjà utilisée'
                }
            });
        }

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création de l'utilisateur
        const newUser = await User.create({
            username,
            password_hash: hashedPassword,
            email,
            display_name,
            role: 'user' // Role par défaut
        });

        // Génération du token JWT
        const token = jwt.sign(
            { 
                id: newUser.id,
                username: newUser.username,
                role: newUser.role 
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Réponse avec le token et les informations de l'utilisateur
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                display_name: newUser.display_name,
                role: newUser.role
            }
        });

    } catch (error) {
        logger.error('Erreur lors de l\'inscription:', error);
        next(error);
    }
};

/**
 * Vérification du token JWT
 */
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: {
                    message: 'Token non fourni'
                }
            });
        }

        // Vérification du token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Récupération des informations utilisateur à jour
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                error: {
                    message: 'Utilisateur non trouvé'
                }
            });
        }

        res.json({
            valid: true,
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                role: user.role
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: {
                    message: 'Token invalide'
                }
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: {
                    message: 'Token expiré'
                }
            });
        }
        logger.error('Erreur lors de la vérification du token:', error);
        next(error);
    }
};