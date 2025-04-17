const winston = require('winston');
const path = require('path');
const config = require('../config/config');

// Configuration des formats de log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Configuration des transports de log selon l'environnement
const transports = [
  // Toujours logger les erreurs dans un fichier
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// En développement, ajouter les logs dans la console
if (config.server.env === 'development') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
} else {
  // En production, logger toutes les informations dans un fichier
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level: config.server.env === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: transports,
  // Ne pas arrêter le processus en cas d'erreur non gérée
  exitOnError: false,
});

// Capture des rejets de promesses non gérés
process.on('unhandledRejection', (error) => {
  logger.error('Rejet de promesse non géré:', error);
});

// Capture des exceptions non gérées
process.on('uncaughtException', (error) => {
  logger.error('Exception non gérée:', error);
  // En production, on devrait probablement arrêter le processus
  if (config.server.env === 'production') {
    process.exit(1);
  }
});

module.exports = logger;