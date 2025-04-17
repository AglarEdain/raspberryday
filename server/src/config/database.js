const mysql = require('mysql2/promise');
const config = require('./config');
const logger = require('../utils/logger');

// Création du pool de connexions
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Fonction pour tester la connexion
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('Connexion à la base de données établie avec succès');
    connection.release();
    return true;
  } catch (error) {
    logger.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
};

// Fonction utilitaire pour exécuter des requêtes
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    logger.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
};

// Fonction pour initialiser la base de données
const initDatabase = async () => {
  try {
    // Création des tables dans l'ordre pour respecter les contraintes de clés étrangères
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'user', 'guest') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_role (role)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        description VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        filename VARCHAR(255) NOT NULL UNIQUE,
        original_name VARCHAR(255) NOT NULL,
        type ENUM('image', 'video') NOT NULL,
        size INT NOT NULL,
        caption VARCHAR(255),
        category_id INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        display_count INT NOT NULL DEFAULT 0,
        is_favorite BOOLEAN NOT NULL DEFAULT 0,
        FOREIGN KEY fk_media_user (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY fk_media_category (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_type (type),
        INDEX idx_created_at (created_at),
        INDEX idx_is_favorite (is_favorite)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS display_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        media_id INT NOT NULL,
        scheduled_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        displayed BOOLEAN NOT NULL DEFAULT 0,
        display_time TIMESTAMP NULL,
        FOREIGN KEY fk_queue_media (media_id) REFERENCES media(id) ON DELETE CASCADE,
        INDEX idx_scheduled_time (scheduled_time),
        INDEX idx_displayed (displayed)
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key VARCHAR(50) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description VARCHAR(255),
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Insertion des paramètres par défaut
    const defaultSettings = [
      ['transition_time', '5000', 'Temps de transition entre les médias (ms)'],
      ['display_captions', 'true', 'Afficher les légendes des médias'],
      ['display_user', 'true', 'Afficher le nom de l\'utilisateur'],
      ['display_date', 'true', 'Afficher la date des médias'],
      ['auto_cleanup_days', '30', 'Nombre de jours avant nettoyage automatique'],
      ['max_upload_size', '100000000', 'Taille maximale des fichiers (octets)']
    ];

    for (const [key, value, description] of defaultSettings) {
      await query(`
        INSERT IGNORE INTO settings (key, value, description)
        VALUES (?, ?, ?);
      `, [key, value, description]);
    }

    logger.info('Base de données initialisée avec succès');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  initDatabase
};