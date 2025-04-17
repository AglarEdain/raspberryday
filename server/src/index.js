const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const WebSocket = require('ws');
const config = require('./config/config');
const logger = require('./utils/logger');

// Initialisation de l'application Express
const app = express();

// Middlewares de sécurité et utilitaires
app.use(helmet());
app.use(cors({
  origin: config.security.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/tv', require('./routes/tv.routes'));
app.use('/api/settings', require('./routes/settings.routes'));

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Une erreur interne est survenue',
      status: err.status || 500
    }
  });
});

// Démarrage du serveur HTTP
const server = app.listen(config.server.port, () => {
  logger.info(`Serveur HTTP démarré sur le port ${config.server.port}`);
});

// Configuration du serveur WebSocket
const wss = new WebSocket.Server({ port: config.websocket.port });

wss.on('connection', (ws) => {
  logger.info('Nouvelle connexion WebSocket établie');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.info('Message WebSocket reçu:', data);
    } catch (error) {
      logger.error('Erreur de parsing WebSocket:', error);
    }
  });

  ws.on('close', () => {
    logger.info('Connexion WebSocket fermée');
  });
});

logger.info(`Serveur WebSocket démarré sur le port ${config.websocket.port}`);

// Gestion de l'arrêt gracieux
const gracefulShutdown = () => {
  logger.info('Signal d\'arrêt reçu, fermeture gracieuse...');
  
  server.close(() => {
    logger.info('Serveur HTTP arrêté');
    
    wss.close(() => {
      logger.info('Serveur WebSocket arrêté');
      process.exit(0);
    });
  });

  // Force la fermeture après 10 secondes
  setTimeout(() => {
    logger.error('Fermeture forcée après délai dépassé');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = { app, server, wss };