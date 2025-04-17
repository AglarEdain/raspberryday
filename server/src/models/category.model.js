const { query } = require('../config/database');
const logger = require('../utils/logger');

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.media_count = data.media_count || 0;
  }

  // Créer une nouvelle catégorie
  static async create(categoryData) {
    try {
      // Vérifier si le nom existe déjà
      const existing = await query(
        'SELECT id FROM categories WHERE name = ?',
        [categoryData.name]
      );

      if (existing.length > 0) {
        throw new Error('Une catégorie avec ce nom existe déjà');
      }

      const result = await query(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [categoryData.name, categoryData.description || null]
      );

      return await Category.findById(result.insertId);
    } catch (error) {
      logger.error('Erreur lors de la création de la catégorie:', error);
      throw error;
    }
  }

  // Trouver une catégorie par son ID
  static async findById(id) {
    try {
      const [category] = await query(
        `SELECT c.*, 
                COUNT(m.id) as media_count 
         FROM categories c 
         LEFT JOIN media m ON c.id = m.category_id 
         WHERE c.id = ? 
         GROUP BY c.id`,
        [id]
      );

      return category ? new Category(category) : null;
    } catch (error) {
      logger.error('Erreur lors de la recherche de la catégorie:', error);
      throw error;
    }
  }

  // Mettre à jour une catégorie
  static async update(id, updateData) {
    try {
      const updates = [];
      const values = [];

      if (updateData.name !== undefined) {
        // Vérifier si le nouveau nom n'existe pas déjà
        if (updateData.name) {
          const existing = await query(
            'SELECT id FROM categories WHERE name = ? AND id != ?',
            [updateData.name, id]
          );

          if (existing.length > 0) {
            throw new Error('Une catégorie avec ce nom existe déjà');
          }
        }
        updates.push('name = ?');
        values.push(updateData.name);
      }

      if (updateData.description !== undefined) {
        updates.push('description = ?');
        values.push(updateData.description);
      }

      if (updates.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }

      values.push(id);

      await query(
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await Category.findById(id);
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de la catégorie:', error);
      throw error;
    }
  }

  // Supprimer une catégorie
  static async delete(id) {
    try {
      // Vérifier si la catégorie contient des médias
      const [{ count }] = await query(
        'SELECT COUNT(*) as count FROM media WHERE category_id = ?',
        [id]
      );

      if (count > 0) {
        throw new Error('Impossible de supprimer une catégorie contenant des médias');
      }

      const result = await query(
        'DELETE FROM categories WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Erreur lors de la suppression de la catégorie:', error);
      throw error;
    }
  }

  // Lister toutes les catégories avec statistiques
  static async findAll() {
    try {
      const categories = await query(
        `SELECT c.*, 
                COUNT(m.id) as media_count 
         FROM categories c 
         LEFT JOIN media m ON c.id = m.category_id 
         GROUP BY c.id 
         ORDER BY c.name ASC`
      );

      return categories.map(category => new Category(category));
    } catch (error) {
      logger.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

  // Obtenir les statistiques détaillées d'une catégorie
  async getStats() {
    try {
      const [stats] = await query(
        `SELECT 
          COUNT(*) as total_media,
          SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as total_images,
          SUM(CASE WHEN type = 'video' THEN 1 ELSE 0 END) as total_videos,
          SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as total_favorites,
          SUM(size) as total_size,
          MAX(created_at) as last_media_date
         FROM media 
         WHERE category_id = ?`,
        [this.id]
      );

      return {
        ...stats,
        total_size_formatted: formatBytes(stats.total_size || 0)
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Obtenir les médias d'une catégorie avec pagination
  async getMedia(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const [media, [countResult]] = await Promise.all([
        query(
          `SELECT m.*, u.display_name as user_display_name
           FROM media m
           LEFT JOIN users u ON m.user_id = u.id
           WHERE m.category_id = ?
           ORDER BY m.created_at DESC
           LIMIT ? OFFSET ?`,
          [this.id, limit, offset]
        ),
        query(
          'SELECT COUNT(*) as total FROM media WHERE category_id = ?',
          [this.id]
        )
      ]);

      return {
        media,
        total: countResult.total,
        page,
        limit,
        pages: Math.ceil(countResult.total / limit)
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des médias de la catégorie:', error);
      throw error;
    }
  }

  // Convertir l'instance en objet JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      created_at: this.created_at,
      updated_at: this.updated_at,
      media_count: this.media_count
    };
  }
}

// Fonction utilitaire pour formater les tailles en bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

module.exports = Category;