# Spécifications de la Base de Données - Projet RaspberryDay

## Vue d'ensemble

Ce document détaille la structure de la base de données pour le projet RaspberryDay. Il définit les tables, les relations, les contraintes et les index nécessaires pour stocker et gérer efficacement les données du système.

## Système de gestion de base de données

**SGBD choisi** : MariaDB 10.11

**Justification** :
- Performances élevées et faible empreinte mémoire, adaptées au Raspberry Pi
- Compatibilité complète avec MySQL
- Support des transactions ACID
- Fonctionnalités avancées (vues, procédures stockées, déclencheurs)
- Solution open source avec une communauté active
- Facilité d'installation et de maintenance

## Schéma de la base de données

### Diagramme entité-relation

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│ users          │       │ media          │       │ categories     │
├────────────────┤       ├────────────────┤       ├────────────────┤
│ id             │       │ id             │       │ id             │
│ username       │       │ user_id        │◄──────┤ name           │
│ password_hash  │       │ filename       │       │ description    │
│ email          │       │ original_name  │       │ created_at     │
│ display_name   │       │ type           │       │ updated_at     │
│ role           │       │ size           │       └────────┬───────┘
│ created_at     │       │ caption        │                │
│ updated_at     │       │ category_id    │◄───────────────┘
└────────┬───────┘       │ created_at     │
         │               │ updated_at     │
         └───────────────┤ display_count  │
                         │ is_favorite    │
                         └────────┬───────┘
                                  │
                                  │
                                  ▼
┌────────────────┐       ┌────────────────┐
│ settings       │       │ display_queue  │
├────────────────┤       ├────────────────┤
│ id             │       │ id             │
│ key            │       │ media_id       │
│ value          │       │ scheduled_time │
│ description    │       │ displayed      │
│ updated_at     │       │ display_time   │
└────────────────┘       └────────────────┘
```

## Définition des tables

### Table `users`

Stocke les informations des utilisateurs du système.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique de l'utilisateur |
| username | VARCHAR(50) | NOT NULL, UNIQUE | Nom d'utilisateur pour la connexion |
| password_hash | VARCHAR(255) | NOT NULL | Hash bcrypt du mot de passe |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Adresse email de l'utilisateur |
| display_name | VARCHAR(100) | NOT NULL | Nom affiché dans l'interface |
| role | ENUM('admin', 'user', 'guest') | NOT NULL, DEFAULT 'user' | Rôle de l'utilisateur |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de création du compte |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

**Index** :
- PRIMARY KEY (id)
- UNIQUE INDEX idx_username (username)
- UNIQUE INDEX idx_email (email)
- INDEX idx_role (role)

**Exemple de création** :
```sql
CREATE TABLE users (
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
```

### Table `categories`

Stocke les catégories pour organiser les médias.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique de la catégorie |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Nom de la catégorie |
| description | VARCHAR(255) | NULL | Description de la catégorie |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

**Index** :
- PRIMARY KEY (id)
- UNIQUE INDEX idx_name (name)

**Exemple de création** :
```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table `media`

Stocke les métadonnées des médias (photos et vidéos).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique du média |
| user_id | INT | NOT NULL, FOREIGN KEY | Utilisateur ayant envoyé le média |
| filename | VARCHAR(255) | NOT NULL, UNIQUE | Nom du fichier sur le système |
| original_name | VARCHAR(255) | NOT NULL | Nom original du fichier |
| type | ENUM('image', 'video') | NOT NULL | Type de média |
| size | INT | NOT NULL | Taille du fichier en octets |
| caption | VARCHAR(255) | NULL | Légende du média |
| category_id | INT | NULL, FOREIGN KEY | Catégorie du média |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date d'envoi |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |
| display_count | INT | NOT NULL, DEFAULT 0 | Nombre d'affichages |
| is_favorite | BOOLEAN | NOT NULL, DEFAULT 0 | Indique si le média est favori |

**Index** :
- PRIMARY KEY (id)
- FOREIGN KEY fk_media_user (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY fk_media_category (category_id) REFERENCES categories(id) ON DELETE SET NULL
- UNIQUE INDEX idx_filename (filename)
- INDEX idx_type (type)
- INDEX idx_created_at (created_at)
- INDEX idx_is_favorite (is_favorite)

**Exemple de création** :
```sql
CREATE TABLE media (
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
```

### Table `display_queue`

Gère la file d'attente des médias à afficher sur le téléviseur.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique de l'entrée |
| media_id | INT | NOT NULL, FOREIGN KEY | Média à afficher |
| scheduled_time | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Heure prévue d'affichage |
| displayed | BOOLEAN | NOT NULL, DEFAULT 0 | Indique si le média a été affiché |
| display_time | TIMESTAMP | NULL | Heure effective d'affichage |

**Index** :
- PRIMARY KEY (id)
- FOREIGN KEY fk_queue_media (media_id) REFERENCES media(id) ON DELETE CASCADE
- INDEX idx_scheduled_time (scheduled_time)
- INDEX idx_displayed (displayed)

**Exemple de création** :
```sql
CREATE TABLE display_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    media_id INT NOT NULL,
    scheduled_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    displayed BOOLEAN NOT NULL DEFAULT 0,
    display_time TIMESTAMP NULL,
    FOREIGN KEY fk_queue_media (media_id) REFERENCES media(id) ON DELETE CASCADE,
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_displayed (displayed)
);
```

### Table `settings`

Stocke les paramètres de configuration du système.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique du paramètre |
| key | VARCHAR(50) | NOT NULL, UNIQUE | Clé du paramètre |
| value | TEXT | NOT NULL | Valeur du paramètre (stockée en JSON pour les structures complexes) |
| description | VARCHAR(255) | NULL | Description du paramètre |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

**Index** :
- PRIMARY KEY (id)
- UNIQUE INDEX idx_key (key)

**Exemple de création** :
```sql
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(50) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Données initiales

### Utilisateur administrateur par défaut

```sql
INSERT INTO users (username, password_hash, email, display_name, role)
VALUES (
    'admin',
    '$2b$10$X7VYVus9eFWYKjXrN1bYh.3sCT8RQ5J2SvgnHVdF3JVpJtWkA3LD2', -- 'admin123' hashé avec bcrypt
    'admin@raspberryday.local',
    'Administrateur',
    'admin'
);
```

### Catégories par défaut

```sql
INSERT INTO categories (name, description) VALUES
('Famille', 'Photos et vidéos de famille'),
('Vacances', 'Souvenirs de vacances'),
('Événements', 'Célébrations et événements spéciaux'),
('Divers', 'Autres médias');
```

### Paramètres par défaut

```sql
INSERT INTO settings (`key`, value, description) VALUES
('display_time', '15', 'Durée d''affichage des images en secondes'),
('video_max_duration', '60', 'Durée maximale des vidéos en secondes'),
('transition_effect', 'fade', 'Effet de transition entre les médias'),
('show_captions', 'true', 'Afficher les légendes des médias'),
('show_user', 'true', 'Afficher le nom de l''utilisateur'),
('show_date', 'true', 'Afficher la date d''envoi'),
('screensaver_timeout', '30', 'Délai avant activation de l''économiseur d''écran en minutes'),
('screensaver_type', 'clock', 'Type d''économiseur d''écran'),
('screen_off_timeout', '120', 'Délai avant extinction de l''écran en minutes'),
('show_notifications', 'true', 'Afficher les notifications de nouveaux médias'),
('notification_duration', '10', 'Durée d''affichage des notifications en secondes'),
('notification_sound', 'soft', 'Son de notification'),
('auto_cleanup', 'false', 'Suppression automatique des anciens médias'),
('cleanup_days', '365', 'Nombre de jours avant suppression automatique'),
('max_file_size', '100000000', 'Taille maximale des fichiers en octets (100 MB)');
```

## Procédures stockées

### Procédure `get_next_media`

Récupère le prochain média à afficher dans la file d'attente.

```sql
DELIMITER //

CREATE PROCEDURE get_next_media()
BEGIN
    DECLARE media_id_var INT;
    
    -- Récupérer le prochain média programmé non affiché
    SELECT media_id INTO media_id_var
    FROM display_queue
    WHERE displayed = 0 AND scheduled_time <= NOW()
    ORDER BY scheduled_time ASC
    LIMIT 1;
    
    -- Si aucun média programmé, prendre le plus ancien non affiché récemment
    IF media_id_var IS NULL THEN
        SELECT id INTO media_id_var
        FROM media
        WHERE id NOT IN (
            SELECT media_id 
            FROM display_queue 
            WHERE display_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
        )
        ORDER BY display_count ASC, RAND()
        LIMIT 1;
    END IF;
    
    -- Insérer dans la file d'attente si nécessaire
    IF media_id_var IS NOT NULL THEN
        INSERT INTO display_queue (media_id, scheduled_time, displayed, display_time)
        VALUES (media_id_var, NOW(), 1, NOW());
        
        -- Mettre à jour le compteur d'affichage
        UPDATE media SET display_count = display_count + 1 WHERE id = media_id_var;
    END IF;
    
    -- Retourner les informations complètes du média
    SELECT m.*, u.display_name as user_name, c.name as category_name
    FROM media m
    LEFT JOIN users u ON m.user_id = u.id
    LEFT JOIN categories c ON m.category_id = c.id
    WHERE m.id = media_id_var;
END //

DELIMITER ;
```

### Procédure `cleanup_old_media`

Supprime les médias plus anciens qu'un certain nombre de jours, si la suppression automatique est activée.

```sql
DELIMITER //

CREATE PROCEDURE cleanup_old_media()
BEGIN
    DECLARE auto_cleanup_var BOOLEAN;
    DECLARE cleanup_days_var INT;
    
    -- Récupérer les paramètres
    SELECT 
        CASE WHEN value = 'true' THEN 1 ELSE 0 END INTO auto_cleanup_var
    FROM settings
    WHERE `key` = 'auto_cleanup';
    
    SELECT 
        CAST(value AS UNSIGNED) INTO cleanup_days_var
    FROM settings
    WHERE `key` = 'cleanup_days';
    
    -- Si la suppression automatique est activée
    IF auto_cleanup_var = 1 AND cleanup_days_var > 0 THEN
        -- Supprimer les anciens médias
        DELETE FROM media
        WHERE created_at < DATE_SUB(NOW(), INTERVAL cleanup_days_var DAY)
        AND is_favorite = 0;
    END IF;
END //

DELIMITER ;
```

## Déclencheurs (Triggers)

### Trigger `before_media_delete`

Supprime les fichiers physiques associés à un média lors de sa suppression de la base de données.

```sql
DELIMITER //

CREATE TRIGGER before_media_delete
BEFORE DELETE ON media
FOR EACH ROW
BEGIN
    -- Ce trigger nécessite une fonction personnalisée ou une procédure externe
    -- pour supprimer les fichiers physiques, car MySQL/MariaDB ne peut pas
    -- directement manipuler les fichiers du système.
    -- 
    -- Dans une implémentation réelle, cette opération serait gérée par le code
    -- de l'application ou par un événement de base de données qui déclencherait
    -- un script externe.
    
    -- Exemple conceptuel (non fonctionnel en SQL pur) :
    -- CALL delete_media_files(OLD.filename);
END //

DELIMITER ;
```

## Événements

### Événement `daily_cleanup`

Exécute la procédure de nettoyage des anciens médias une fois par jour.

```sql
DELIMITER //

CREATE EVENT daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
BEGIN
    CALL cleanup_old_media();
END //

DELIMITER ;
```

## Considérations de performance

### Indexation

Les index définis sur les tables sont conçus pour optimiser les requêtes les plus fréquentes :
- Recherche de médias par utilisateur, catégorie ou type
- Tri chronologique des médias
- Vérification de l'état d'affichage des médias
- Recherche de paramètres par clé

### Partitionnement

Pour les installations avec un grand volume de médias, envisager le partitionnement de la table `media` par plage de dates :

```sql
ALTER TABLE media
PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p0 VALUES LESS THAN (TO_DAYS('2023-01-01')),
    PARTITION p1 VALUES LESS THAN (TO_DAYS('2023-04-01')),
    PARTITION p2 VALUES LESS THAN (TO_DAYS('2023-07-01')),
    PARTITION p3 VALUES LESS THAN (TO_DAYS('2023-10-01')),
    PARTITION p4 VALUES LESS THAN (TO_DAYS('2024-01-01')),
    PARTITION p5 VALUES LESS THAN MAXVALUE
);
```

### Optimisation des requêtes

- Utiliser des requêtes préparées pour les opérations fréquentes
- Limiter les résultats avec LIMIT pour les grandes tables
- Utiliser des jointures optimisées (LEFT JOIN uniquement lorsque nécessaire)
- Éviter les sous-requêtes corrélées en faveur des jointures

## Maintenance de la base de données

### Sauvegardes

Configuration recommandée pour les sauvegardes :

```bash
# Sauvegarde quotidienne complète
mysqldump -u root -p --single-transaction --routines --triggers --events raspberryday > /media/ssd/backups/raspberryday_$(date +%Y%m%d).sql

# Conservation des 30 dernières sauvegardes
find /media/ssd/backups -name "raspberryday_*.sql" -type f -mtime +30 -delete
```

### Optimisation périodique

Script recommandé pour l'optimisation périodique :

```sql
-- Analyser et optimiser les tables
ANALYZE TABLE users, categories, media, display_queue, settings;
OPTIMIZE TABLE users, categories, media, display_queue, settings;

-- Vérifier et réparer si nécessaire
CHECK TABLE users, categories, media, display_queue, settings;
```

## Migration et versionnement

Pour gérer les migrations de schéma, nous recommandons l'utilisation d'un outil comme Knex.js ou Sequelize avec Node.js, qui permettra de :

1. Versionner les changements de schéma
2. Appliquer les migrations de manière incrémentale
3. Revenir à une version antérieure si nécessaire
4. Générer automatiquement les requêtes SQL optimisées

Exemple de migration avec Knex.js :

```javascript
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.string('username', 50).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('display_name', 100).notNullable();
    table.enum('role', ['admin', 'user', 'guest']).notNullable().defaultTo('user');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index('role', 'idx_role');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
```

## Conclusion

Cette structure de base de données est conçue pour répondre aux besoins du projet RaspberryDay tout en optimisant les performances sur un Raspberry Pi. Elle offre une organisation claire des données, des relations bien définies entre les entités, et des mécanismes d'optimisation adaptés aux contraintes matérielles.

Les procédures stockées, déclencheurs et événements permettent d'automatiser certaines tâches de maintenance et de gestion des médias, réduisant ainsi la charge sur l'application principale.

Cette conception prend également en compte les besoins futurs avec des possibilités d'extension pour de nouvelles fonctionnalités, tout en maintenant la compatibilité avec les versions antérieures grâce à un système de migration robuste.