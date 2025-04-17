const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// Middleware de vérification du token JWT
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: {
          message: 'Token d\'authentification manquant',
          status: 401
        }
      });
    }

    // Extraire le token du header "Bearer {token}"
    const token = authHeader.split(' ')[1];

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Récupérer l'utilisateur depuis la base de données
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Utilisateur non trouvé',
            status: 401
          }
        });
      }

      // Ajouter l'utilisateur à l'objet request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            message: 'Token expiré',
            status: 401
          }
        });
      }
      
      return res.status(401).json({
        error: {
          message: 'Token invalide',
          status: 401
        }
      });
    }
  } catch (error) {
    logger.error('Erreur dans le middleware d\'authentification:', error);
    next(error);
  }
};

// Middleware de vérification des rôles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Non authentifié',
          status: 401
        }
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: {
          message: 'Accès non autorisé',
          status: 403
        }
      });
    }

    next();
  };
};

// Middleware de vérification de propriété de média
const checkMediaOwnership = async (req, res, next) => {
  try {
    const mediaId = req.params.id;
    const userId = req.user.id;

    // Les administrateurs peuvent accéder à tous les médias
    if (req.user.role === 'admin') {
      return next();
    }

    const [media] = await query(
      'SELECT user_id FROM media WHERE id = ?',
      [mediaId]
    );

    if (!media) {
      return res.status(404).json({
        error: {
          message: 'Média non trouvé',
          status: 404
        }
      });
    }

    if (media.user_id !== userId) {
      return res.status(403).json({
        error: {
          message: 'Accès non autorisé à ce média',
          status: 403
        }
      });
    }

    next();
  } catch (error) {
    logger.error('Erreur dans la vérification de propriété:', error);
    next(error);
  }
};

// Middleware de limitation de taille de fichier
const checkFileSize = (maxSize) => {
  return (req, res, next) => {
    if (!req.files || !req.files.length) {
      return next();
    }

    const oversizedFiles = req.files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      // Nettoyer les fichiers temporaires
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) logger.error('Erreur lors de la suppression du fichier temporaire:', err);
        });
      });

      return res.status(413).json({
        error: {
          message: `Les fichiers suivants dépassent la taille maximale autorisée: ${oversizedFiles.map(f => f.originalname).join(', ')}`,
          status: 413
        }
      });
    }

    next();
  };
};

// Middleware de vérification du type MIME
const checkMimeType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.files || !req.files.length) {
      return next();
    }

    const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));

    if (invalidFiles.length > 0) {
      // Nettoyer les fichiers temporaires
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) logger.error('Erreur lors de la suppression du fichier temporaire:', err);
        });
      });

      return res.status(415).json({
        error: {
          message: `Types de fichiers non autorisés: ${invalidFiles.map(f => f.originalname).join(', ')}`,
          status: 415
        }
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
  checkMediaOwnership,
  checkFileSize,
  checkMimeType
};