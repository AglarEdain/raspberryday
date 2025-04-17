require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'raspberryday',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'raspberryday_db',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  media: {
    uploadDir: process.env.UPLOAD_DIR || '/media/storage',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 100000000,
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,video/mp4').split(','),
    thumbnails: {
      width: parseInt(process.env.THUMBNAIL_WIDTH) || 300,
      height: parseInt(process.env.THUMBNAIL_HEIGHT) || 300,
    },
    optimized: {
      width: parseInt(process.env.OPTIMIZED_WIDTH) || 1920,
      height: parseInt(process.env.OPTIMIZED_HEIGHT) || 1080,
    },
  },
  
  websocket: {
    port: parseInt(process.env.WS_PORT) || 3001,
  },
  
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW || '15m',
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    },
  },
};

// Validation des configurations critiques
const requiredConfigs = [
  { key: 'database.password', value: config.database.password },
  { key: 'jwt.secret', value: config.jwt.secret },
];

requiredConfigs.forEach(({ key, value }) => {
  if (!value) {
    throw new Error(`Configuration manquante : ${key}`);
  }
});

// Validation des chemins de stockage
const fs = require('fs');
const path = require('path');

const ensureDirectoryExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Répertoire créé : ${dirPath}`);
    }
  } catch (error) {
    throw new Error(`Impossible de créer le répertoire ${dirPath}: ${error.message}`);
  }
};

// Création des répertoires nécessaires
const mediaDirectories = [
  config.media.uploadDir,
  path.join(config.media.uploadDir, 'thumbnails'),
  path.join(config.media.uploadDir, 'optimized'),
  path.join(config.media.uploadDir, 'original'),
  path.join(config.media.uploadDir, 'temp'),
];

mediaDirectories.forEach(ensureDirectoryExists);

module.exports = config;