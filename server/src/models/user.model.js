const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const logger = require('../utils/logger');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.display_name = data.display_name;
    this.role = data.role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Trouver un utilisateur par son nom d'utilisateur
  static async findByUsername(username) {
    try {
      const users = await query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return users.length ? new User(users[0]) : null;
    } catch (error) {
      logger.error('Erreur lors de la recherche de l\'utilisateur:', error);
      throw error;
    }
  }

  // Trouver un utilisateur par son ID
  static async findById(id) {
    try {
      const users = await query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return users.length ? new User(users[0]) : null;
    } catch (error) {
      logger.error('Erreur lors de la recherche de l\'utilisateur:', error);
      throw error;
    }
  }

  // Créer un nouvel utilisateur
  static async create(userData) {
    try {
      // Vérification de l'unicité du nom d'utilisateur et de l'email
      const existingUser = await query(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [userData.username, userData.email]
      );

      if (existingUser.length > 0) {
        throw new Error('Nom d\'utilisateur ou email déjà utilisé');
      }

      // Hashage du mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Insertion de l'utilisateur
      const result = await query(
        `INSERT INTO users (username, password_hash, email, display_name, role)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userData.username,
          hashedPassword,
          userData.email,
          userData.display_name,
          userData.role || 'user'
        ]
      );

      // Récupération de l'utilisateur créé
      return await User.findById(result.insertId);
    } catch (error) {
      logger.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  // Mettre à jour un utilisateur
  static async update(id, updateData) {
    try {
      const updates = [];
      const values = [];

      // Construction dynamique de la requête de mise à jour
      if (updateData.email) {
        updates.push('email = ?');
        values.push(updateData.email);
      }
      if (updateData.display_name) {
        updates.push('display_name = ?');
        values.push(updateData.display_name);
      }
      if (updateData.role) {
        updates.push('role = ?');
        values.push(updateData.role);
      }
      if (updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, 10);
        updates.push('password_hash = ?');
        values.push(hashedPassword);
      }

      if (updates.length === 0) {
        throw new Error('Aucune donnée à mettre à jour');
      }

      values.push(id);

      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await User.findById(id);
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  // Supprimer un utilisateur
  static async delete(id) {
    try {
      const result = await query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // Lister tous les utilisateurs avec pagination
  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const [users, [countResult]] = await Promise.all([
        query(
          'SELECT * FROM users LIMIT ? OFFSET ?',
          [limit, offset]
        ),
        query('SELECT COUNT(*) as total FROM users')
      ]);

      return {
        users: users.map(user => new User(user)),
        total: countResult.total,
        page,
        limit,
        pages: Math.ceil(countResult.total / limit)
      };
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  // Vérifier le mot de passe d'un utilisateur
  static async verifyPassword(username, password) {
    try {
      const [user] = await query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password_hash);
      return isValid ? new User(user) : null;
    } catch (error) {
      logger.error('Erreur lors de la vérification du mot de passe:', error);
      throw error;
    }
  }

  // Obtenir les statistiques d'un utilisateur
  async getStats() {
    try {
      const [mediaStats] = await query(
        `SELECT 
          COUNT(*) as total_media,
          SUM(CASE WHEN type = 'image' THEN 1 ELSE 0 END) as total_images,
          SUM(CASE WHEN type = 'video' THEN 1 ELSE 0 END) as total_videos,
          SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as total_favorites
         FROM media 
         WHERE user_id = ?`,
        [this.id]
      );

      return mediaStats;
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Convertir l'instance en objet JSON sécurisé (sans données sensibles)
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      display_name: this.display_name,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = User;