-- Script de création et peuplement de la base de données RaspberryDay

-- Création des tables
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

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(50) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Données initiales
INSERT INTO users (username, password_hash, email, display_name, role) VALUES
('admin', '$2b$10$X7VYVus9eFWYKjXrN1bYh.3sCT8RQ5J2SvgnHVdF3JVpJtWkA3LD2', 'admin@raspberryday.local', 'Administrateur', 'admin');

INSERT INTO categories (name, description) VALUES
('Famille', 'Photos et vidéos de famille'),
('Vacances', 'Souvenirs de vacances'),
('Événements', 'Célébrations et événements spéciaux'),
('Divers', 'Autres médias');

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

-- Procédures stockées
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
