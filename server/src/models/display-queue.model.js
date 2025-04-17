const { query } = require('../config/database');
const logger = require('../utils/logger');

class DisplayQueue {
  constructor(data) {
    this.id = data.id;
    this.media_id = data.media_id;
    this.scheduled_time = data.scheduled_time;
    this.displayed = data.displayed;
    this.display_time = data.display_time;
    // Inclure les données du média si disponibles
    if (data.media) {
      this.media = data.media;
    }
  }

  // Ajouter un média à la file d'attente
  static async add(mediaId, scheduledTime = null) {
    try {
      // Vérifier si le média existe
      const [mediaExists] = await query(
        'SELECT id FROM media WHERE id = ?',
        [mediaId]
      );

      if (!mediaExists) {
        throw new Error('Média non trouvé');
      }

      // Si pas d'heure programmée, utiliser l'heure actuelle
      const scheduleTime = scheduledTime || new Date();

      const result = await query(
        'INSERT INTO display_queue (media_id, scheduled_time) VALUES (?, ?)',
        [mediaId, scheduleTime]
      );

      return await DisplayQueue.findById(result.insertId);
    } catch (error) {
      logger.error('Erreur lors de l\'ajout à la file d\'attente:', error);
      throw error;
    }
  }

  // Trouver une entrée de la file par son ID
  static async findById(id) {
    try {
      const [queueItem] = await query(
        `SELECT q.*, 
                m.filename, m.type, m.caption,
                u.display_name as user_display_name
         FROM display_queue q
         JOIN media m ON q.media_id = m.id
         LEFT JOIN users u ON m.user_id = u.id
         WHERE q.id = ?`,
        [id]
      );

      if (!queueItem) return null;

      // Structurer les données du média
      queueItem.media = {
        id: queueItem.media_id,
        filename: queueItem.filename,
        type: queueItem.type,
        caption: queueItem.caption,
        user_display_name: queueItem.user_display_name
      };

      return new DisplayQueue(queueItem);
    } catch (error) {
      logger.error('Erreur lors de la recherche dans la file d\'attente:', error);
      throw error;
    }
  }

  // Obtenir les prochains médias à afficher
  static async getNextItems(limit = 10) {
    try {
      const items = await query(
        `SELECT q.*, 
                m.filename, m.type, m.caption,
                u.display_name as user_display_name
         FROM display_queue q
         JOIN media m ON q.media_id = m.id
         LEFT JOIN users u ON m.user_id = u.id
         WHERE q.displayed = 0
         ORDER BY q.scheduled_time ASC
         LIMIT ?`,
        [limit]
      );

      return items.map(item => {
        item.media = {
          id: item.media_id,
          filename: item.filename,
          type: item.type,
          caption: item.caption,
          user_display_name: item.user_display_name
        };
        return new DisplayQueue(item);
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des prochains médias:', error);
      throw error;
    }
  }

  // Marquer un média comme affiché
  static async markAsDisplayed(id) {
    try {
      await query(
        `UPDATE display_queue 
         SET displayed = 1, display_time = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [id]
      );

      // Mettre à jour le compteur d'affichage du média
      const [queueItem] = await query(
        'SELECT media_id FROM display_queue WHERE id = ?',
        [id]
      );

      if (queueItem) {
        await query(
          'UPDATE media SET display_count = display_count + 1 WHERE id = ?',
          [queueItem.media_id]
        );
      }

      return await DisplayQueue.findById(id);
    } catch (error) {
      logger.error('Erreur lors du marquage comme affiché:', error);
      throw error;
    }
  }

  // Nettoyer les entrées anciennes et affichées
  static async cleanup(olderThan = '24 hours') {
    try {
      const result = await query(
        `DELETE FROM display_queue 
         WHERE displayed = 1 
         AND display_time < DATE_SUB(NOW(), INTERVAL ?)`,
        [olderThan]
      );

      return result.affectedRows;
    } catch (error) {
      logger.error('Erreur lors du nettoyage de la file d\'attente:', error);
      throw error;
    }
  }

  // Réorganiser la file d'attente
  static async reorder(itemId, newPosition) {
    try {
      // Récupérer l'élément à déplacer
      const [item] = await query(
        'SELECT * FROM display_queue WHERE id = ?',
        [itemId]
      );

      if (!item) {
        throw new Error('Élément non trouvé');
      }

      // Récupérer les éléments non affichés dans l'ordre
      const items = await query(
        'SELECT * FROM display_queue WHERE displayed = 0 ORDER BY scheduled_time ASC'
      );

      // Calculer le nouveau temps programmé
      const currentIndex = items.findIndex(i => i.id === itemId);
      if (currentIndex === -1) {
        throw new Error('Élément non trouvé dans la file d\'attente active');
      }

      // Déplacer l'élément à la nouvelle position
      items.splice(currentIndex, 1);
      items.splice(newPosition, 0, item);

      // Mettre à jour les temps programmés
      const baseTime = new Date();
      const interval = 5 * 60 * 1000; // 5 minutes entre chaque média

      for (let i = 0; i < items.length; i++) {
        const newTime = new Date(baseTime.getTime() + (i * interval));
        await query(
          'UPDATE display_queue SET scheduled_time = ? WHERE id = ?',
          [newTime, items[i].id]
        );
      }

      return await DisplayQueue.getNextItems();
    } catch (error) {
      logger.error('Erreur lors de la réorganisation de la file d\'attente:', error);
      throw error;
    }
  }

  // Obtenir les statistiques de la file d'attente
  static async getStats() {
    try {
      const [stats] = await query(
        `SELECT 
          COUNT(*) as total_items,
          SUM(CASE WHEN displayed = 1 THEN 1 ELSE 0 END) as displayed_items,
          SUM(CASE WHEN displayed = 0 THEN 1 ELSE 0 END) as pending_items,
          MIN(CASE WHEN displayed = 0 THEN scheduled_time END) as next_display_time,
          MAX(display_time) as last_display_time
         FROM display_queue`
      );

      return stats;
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Convertir l'instance en objet JSON
  toJSON() {
    return {
      id: this.id,
      media_id: this.media_id,
      scheduled_time: this.scheduled_time,
      displayed: this.displayed,
      display_time: this.display_time,
      media: this.media
    };
  }
}

module.exports = DisplayQueue;