const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { query } = require('../config/database');
const config = require('../config/config');
const logger = require('../utils/logger');

class Media {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.filename = data.filename;
    this.original_name = data.original_name;
    this.type = data.type;
    this.size = data.size;
    this.caption = data.caption;
    this.category_id = data.category_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.display_count = data.display_count;
    this.is_favorite = data.is_favorite;
  }

  // Créer un nouveau média
  static async create(mediaData, file) {
    try {
      // Générer un nom de fichier unique
      const fileExt = path.extname(file.originalname);
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
      
      // Déterminer le type de média
      const type = file.mimetype.startsWith('image/') ? 'image' : 'video';

      // Chemins des fichiers
      const originalPath = path.join(config.media.uploadDir, 'original', uniqueFilename);
      const thumbnailPath = path.join(config.media.uploadDir, 'thumbnails', uniqueFilename);
      const optimizedPath = path.join(config.media.uploadDir, 'optimized', uniqueFilename);

      // Déplacer le fichier original
      await fs.rename(file.path, originalPath);

      // Traitement des images
      if (type === 'image') {
        // Créer la miniature
        await sharp(originalPath)
          .resize(config.media.thumbnails.width, config.media.thumbnails.height, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);

        // Créer la version optimisée
        await sharp(originalPath)
          .resize(config.media.optimized.width, config.media.optimized.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);
      } else {
        // Pour les vidéos, on pourrait implémenter ici la génération de thumbnail
        // et l'optimisation avec ffmpeg (à implémenter plus tard)
        logger.info('Traitement des vidéos non implémenté pour le moment');
      }

      // Insérer les métadonnées dans la base de données
      const result = await query(
        `INSERT INTO media (
          user_id, filename, original_name, type, size, caption, category_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          mediaData.user_id,
          uniqueFilename,
          file.originalname,
          type,
          file.size,
          mediaData.caption || null,
          mediaData.category_id || null
        ]
      );

      return await Media.findById(result.insertId);
    } catch (error) {
      logger.error('Erreur lors de la création du média:', error);
      throw error;
    }
  }

  // Trouver un média par son ID
  static async findById(id) {
    try {
      const [media] = await query(
        `SELECT m.*, 
                u.display_name as user_display_name,
                c.name as category_name
         FROM media m
         LEFT JOIN users u ON m.user_id = u.id
         LEFT JOIN categories c ON m.category_id = c.id
         WHERE m.id = ?`,
        [id]
      );

      if (!media) return null;

      // Ajouter les URLs des fichiers
      media.urls = Media.generateUrls(media.filename);
      
      return new Media(media);
    } catch (error) {
      logger.error('Erreur lors de la recherche du média:', error);
      throw error;
    }
  }

  // Générer les URLs pour les différentes versions du média
  static generateUrls(filename) {
    return {
      original: `/media/original/${filename}`,
      thumbnail: `/media/thumbnails/${filename}`,
      optimized: `/media/optimized/${filename}`
    };
  }

  // Mettre à jour un média
  static async update(id, updateData) {
    try {
      const updates = [];
      const values = [];

      // Construction dynamique de la requête de mise à jour
      if (updateData.caption !== undefined) {
        updates.push('caption = ?');
        values.push(updateData.caption);
      }
      if (updateData.category_id !== undefined) {
        updates.push('category_id = ?');
        values.push(updateData.category_id);
      }
      if (updateData.is_favorite !== undefined) {
        updates.push('is_favorite = ?');
        values.push(updateData.is_favorite);
      }

      if (updates.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }

      values.push(id);

      await query(
        `UPDATE media SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await Media.findById(id);
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du média:', error);
      throw error;
    }
  }

  // Supprimer un média
  static async delete(id) {
    try {
      // Récupérer les informations du média avant suppression
      const media = await Media.findById(id);
      if (!media) {
        throw new Error('Média non trouvé');
      }

      // Supprimer les fichiers
      const filesToDelete = [
        path.join(config.media.uploadDir, 'original', media.filename),
        path.join(config.media.uploadDir, 'thumbnails', media.filename),
        path.join(config.media.uploadDir, 'optimized', media.filename)
      ];

      await Promise.all(filesToDelete.map(file => 
        fs.unlink(file).catch(err => 
          logger.warn(`Impossible de supprimer le fichier ${file}:`, err)
        )
      ));

      // Supprimer l'entrée de la base de données
      await query('DELETE FROM media WHERE id = ?', [id]);

      return true;
    } catch (error) {
      logger.error('Erreur lors de la suppression du média:', error);
      throw error;
    }
  }

  // Rechercher des médias avec filtres et pagination
  static async findAll({
    page = 1,
    limit = 20,
    userId = null,
    categoryId = null,
    type = null,
    isFavorite = null,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = {}) {
    try {
      const offset = (page - 1) * limit;
      let conditions = [];
      let values = [];

      if (userId) {
        conditions.push('m.user_id = ?');
        values.push(userId);
      }
      if (categoryId) {
        conditions.push('m.category_id = ?');
        values.push(categoryId);
      }
      if (type) {
        conditions.push('m.type = ?');
        values.push(type);
      }
      if (isFavorite !== null) {
        conditions.push('m.is_favorite = ?');
        values.push(isFavorite);
      }

      const whereClause = conditions.length > 0 
        ? 'WHERE ' + conditions.join(' AND ')
        : '';

      // Validation du tri
      const allowedSortFields = ['created_at', 'display_count', 'size'];
      const allowedSortOrders = ['ASC', 'DESC'];
      
      if (!allowedSortFields.includes(sortBy)) sortBy = 'created_at';
      if (!allowedSortOrders.includes(sortOrder.toUpperCase())) sortOrder = 'DESC';

      const [media, [countResult]] = await Promise.all([
        query(
          `SELECT m.*, 
                  u.display_name as user_display_name,
                  c.name as category_name
           FROM media m
           LEFT JOIN users u ON m.user_id = u.id
           LEFT JOIN categories c ON m.category_id = c.id
           ${whereClause}
           ORDER BY m.${sortBy} ${sortOrder}
           LIMIT ? OFFSET ?`,
          [...values, limit, offset]
        ),
        query(
          `SELECT COUNT(*) as total 
           FROM media m 
           ${whereClause}`,
          values
        )
      ]);

      // Ajouter les URLs pour chaque média
      const mediaWithUrls = media.map(m => ({
        ...m,
        urls: Media.generateUrls(m.filename)
      }));

      return {
        media: mediaWithUrls.map(m => new Media(m)),
        total: countResult.total,
        page,
        limit,
        pages: Math.ceil(countResult.total / limit)
      };
    } catch (error) {
      logger.error('Erreur lors de la recherche des médias:', error);
      throw error;
    }
  }

  // Incrémenter le compteur d'affichage
  async incrementDisplayCount() {
    try {
      await query(
        'UPDATE media SET display_count = display_count + 1 WHERE id = ?',
        [this.id]
      );
      this.display_count += 1;
    } catch (error) {
      logger.error('Erreur lors de l\'incrémentation du compteur d\'affichage:', error);
      throw error;
    }
  }

  // Convertir l'instance en objet JSON
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      filename: this.filename,
      original_name: this.original_name,
      type: this.type,
      size: this.size,
      caption: this.caption,
      category_id: this.category_id,
      created_at: this.created_at,
      updated_at: this.updated_at,
      display_count: this.display_count,
      is_favorite: this.is_favorite,
      urls: Media.generateUrls(this.filename)
    };
  }
}

module.exports = Media;