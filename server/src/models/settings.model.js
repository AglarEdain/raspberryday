const { query } = require('../config/database');
const logger = require('../utils/logger');

class Settings {
  constructor(data) {
    this.id = data.id;
    this.key = data.key;
    this.value = data.value;
    this.description = data.description;
    this.updated_at = data.updated_at;
  }

  // Obtenir un paramètre par sa clé
  static async get(key) {
    try {
      const [setting] = await query(
        'SELECT * FROM settings WHERE `key` = ?',
        [key]
      );

      if (!setting) {
        return null;
      }

      // Tenter de parser la valeur JSON si possible
      try {
        setting.value = JSON.parse(setting.value);
      } catch (e) {
        // Si ce n'est pas du JSON, garder la valeur telle quelle
      }

      return new Settings(setting);
    } catch (error) {
      logger.error('Erreur lors de la récupération du paramètre:', error);
      throw error;
    }
  }

  // Obtenir plusieurs paramètres par leurs clés
  static async getMultiple(keys) {
    try {
      const settings = await query(
        'SELECT * FROM settings WHERE `key` IN (?)',
        [keys]
      );

      return settings.map(setting => {
        try {
          setting.value = JSON.parse(setting.value);
        } catch (e) {
          // Si ce n'est pas du JSON, garder la valeur telle quelle
        }
        return new Settings(setting);
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  }

  // Définir ou mettre à jour un paramètre
  static async set(key, value, description = null) {
    try {
      // Convertir les objets/tableaux en JSON
      const stringValue = typeof value === 'object' 
        ? JSON.stringify(value)
        : String(value);

      const result = await query(
        `INSERT INTO settings (\`key\`, value, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
         value = VALUES(value),
         description = COALESCE(VALUES(description), description)`,
        [key, stringValue, description]
      );

      return await Settings.get(key);
    } catch (error) {
      logger.error('Erreur lors de la définition du paramètre:', error);
      throw error;
    }
  }

  // Définir plusieurs paramètres à la fois
  static async setMultiple(settings) {
    try {
      const results = await Promise.all(
        settings.map(({ key, value, description }) =>
          Settings.set(key, value, description)
        )
      );

      return results;
    } catch (error) {
      logger.error('Erreur lors de la définition des paramètres:', error);
      throw error;
    }
  }

  // Supprimer un paramètre
  static async delete(key) {
    try {
      const result = await query(
        'DELETE FROM settings WHERE `key` = ?',
        [key]
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Erreur lors de la suppression du paramètre:', error);
      throw error;
    }
  }

  // Obtenir tous les paramètres
  static async getAll() {
    try {
      const settings = await query('SELECT * FROM settings ORDER BY `key`');

      return settings.map(setting => {
        try {
          setting.value = JSON.parse(setting.value);
        } catch (e) {
          // Si ce n'est pas du JSON, garder la valeur telle quelle
        }
        return new Settings(setting);
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de tous les paramètres:', error);
      throw error;
    }
  }

  // Réinitialiser les paramètres par défaut
  static async resetToDefaults() {
    try {
      const defaultSettings = [
        {
          key: 'display_transition_time',
          value: 5000,
          description: 'Temps de transition entre les médias (ms)'
        },
        {
          key: 'display_captions',
          value: true,
          description: 'Afficher les légendes des médias'
        },
        {
          key: 'display_user_info',
          value: true,
          description: 'Afficher les informations de l\'utilisateur'
        },
        {
          key: 'display_date',
          value: true,
          description: 'Afficher la date des médias'
        },
        {
          key: 'auto_cleanup_days',
          value: 30,
          description: 'Nombre de jours avant nettoyage automatique'
        },
        {
          key: 'max_upload_size',
          value: 100000000,
          description: 'Taille maximale des fichiers (octets)'
        },
        {
          key: 'allowed_file_types',
          value: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
          description: 'Types de fichiers autorisés'
        },
        {
          key: 'screen_saver_timeout',
          value: 3600000,
          description: 'Délai avant activation de l\'économiseur d\'écran (ms)'
        },
        {
          key: 'display_schedule',
          value: {
            enabled: true,
            start_time: '08:00',
            end_time: '22:00'
          },
          description: 'Horaires d\'affichage automatique'
        }
      ];

      // Supprimer tous les paramètres existants
      await query('TRUNCATE TABLE settings');

      // Insérer les paramètres par défaut
      await Settings.setMultiple(defaultSettings);

      return await Settings.getAll();
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation des paramètres:', error);
      throw error;
    }
  }

  // Convertir l'instance en objet JSON
  toJSON() {
    return {
      id: this.id,
      key: this.key,
      value: this.value,
      description: this.description,
      updated_at: this.updated_at
    };
  }
}

module.exports = Settings;