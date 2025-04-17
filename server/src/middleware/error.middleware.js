const logger = require('../utils/logger');

// Classe personnalisée pour les erreurs d'API
class APIError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
  // Logger l'erreur
  logger.error('Erreur interceptée:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user.id : null
  });

  // Si c'est une erreur API personnalisée
  if (err instanceof APIError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        status: err.status,
        details: err.details
      }
    });
  }

  // Gérer les erreurs de validation Mongoose/SQL
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Erreur de validation',
        status: 400,
        details: Object.values(err.errors).map(e => e.message)
      }
    });
  }

  // Gérer les erreurs de duplication (unique constraint)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: {
        message: 'Une ressource avec ces données existe déjà',
        status: 409
      }
    });
  }

  // Gérer les erreurs de clé étrangère
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      error: {
        message: 'Référence invalide',
        status: 400
      }
    });
  }

  // En production, ne pas envoyer les détails de l'erreur
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    error: {
      message: isProduction ? 'Une erreur interne est survenue' : err.message,
      status: 500,
      ...(isProduction ? {} : { stack: err.stack })
    }
  });
};

// Middleware pour les routes non trouvées
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: `Route non trouvée: ${req.method} ${req.originalUrl}`,
      status: 404
    }
  });
};

// Middleware de validation des requêtes
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validationContext = {
        body: req.body,
        query: req.query,
        params: req.params
      };

      const { error } = schema.validate(validationContext, {
        abortEarly: false,
        allowUnknown: true
      });

      if (error) {
        const details = error.details.map(detail => ({
          message: detail.message,
          path: detail.path
        }));

        throw new APIError('Erreur de validation', 400, details);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

// Middleware de gestion des promesses asynchrones
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware de validation des IDs
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || isNaN(parseInt(id))) {
      throw new APIError(`ID invalide: ${id}`, 400);
    }
    
    next();
  };
};

// Middleware de sanitization des entrées
const sanitizeInput = (fields) => {
  return (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field]) {
        // Supprimer les caractères dangereux
        req.body[field] = req.body[field]
          .replace(/[<>]/g, '') // Supprimer les balises HTML
          .trim(); // Supprimer les espaces inutiles
      }
    });
    next();
  };
};

// Middleware de rate limiting basique
const rateLimit = (windowMs = 60000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Nettoyer les anciennes entrées
    requests.forEach((timestamps, key) => {
      requests.set(key, timestamps.filter(time => time > windowStart));
    });

    // Obtenir ou initialiser les timestamps pour cette IP
    const timestamps = requests.get(ip) || [];
    
    // Vérifier le nombre de requêtes dans la fenêtre
    if (timestamps.length >= max) {
      throw new APIError('Trop de requêtes', 429);
    }

    // Ajouter le timestamp actuel
    timestamps.push(now);
    requests.set(ip, timestamps);

    next();
  };
};

module.exports = {
  APIError,
  errorHandler,
  notFoundHandler,
  validateRequest,
  asyncHandler,
  validateId,
  sanitizeInput,
  rateLimit
};