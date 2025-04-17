# Guide d'Installation et Configuration - Projet RaspberryDay

## Introduction

Ce document détaille les étapes nécessaires pour installer et configurer le système RaspberryDay sur un Raspberry Pi. Il couvre l'installation du matériel, la configuration du système d'exploitation, la mise en place des services requis et la configuration initiale de l'application.

## Prérequis

### Matériel requis

- Raspberry Pi 5 (8GB RAM) ou Raspberry Pi 4 (8GB RAM)
- SSD externe (1TB recommandé) avec boîtier USB 3.0
- Carte microSD (32GB minimum, classe A1/A2) pour l'installation initiale
- Câble HDMI (HDMI standard vers micro-HDMI pour Pi 4, HDMI standard vers HDMI standard pour Pi 5)
- Alimentation officielle Raspberry Pi (USB-C, 5V/3A minimum)
- Clavier et souris USB (pour la configuration initiale uniquement)
- Téléviseur compatible HDMI avec CEC
- Connexion Internet (Ethernet recommandé pour la stabilité)

### Logiciels requis

- Raspberry Pi Imager (pour flasher l'OS sur la carte SD)
- Image Raspberry Pi OS 64-bit (Bookworm)
- Navigateur web moderne (pour accéder à l'interface d'administration)

## 1. Installation du matériel

### 1.1 Assemblage du Raspberry Pi

1. Déballez soigneusement le Raspberry Pi et placez-le dans son boîtier
2. Connectez le SSD externe au port USB 3.0 (ports bleus sur le Raspberry Pi 4, ports USB sur le Pi 5)
3. Insérez la carte microSD préalablement flashée
4. Connectez le câble HDMI entre le Raspberry Pi et le téléviseur
5. Connectez le câble Ethernet (recommandé) ou configurez le Wi-Fi ultérieurement
6. Ne branchez pas encore l'alimentation

### 1.2 Préparation du téléviseur

1. Allumez le téléviseur
2. Sélectionnez l'entrée HDMI correspondante
3. Activez la fonctionnalité CEC dans les paramètres du téléviseur (peut être nommée différemment selon les fabricants : Anynet+ (Samsung), BRAVIA Sync (Sony), VIERA Link (Panasonic), SimpLink (LG), etc.)

## 2. Installation du système d'exploitation

### 2.1 Préparation de la carte SD

1. Téléchargez et installez [Raspberry Pi Imager](https://www.raspberrypi.org/software/) sur votre ordinateur
2. Insérez la carte microSD dans votre ordinateur
3. Lancez Raspberry Pi Imager
4. Cliquez sur "CHOISIR L'OS" et sélectionnez "Raspberry Pi OS (64-bit)"
5. Cliquez sur "CHOISIR LE STOCKAGE" et sélectionnez votre carte microSD
6. Cliquez sur l'icône d'engrenage (⚙️) pour accéder aux options avancées
7. Configurez les options suivantes :
   - Activez "Définir le nom d'utilisateur et le mot de passe" et créez un compte (ex: utilisateur "raspberryday", mot de passe sécurisé)
   - Activez "Configurer le Wi-Fi" si vous n'utilisez pas Ethernet
   - Activez "Définir le fuseau horaire" et choisissez votre région
   - Activez "Activer SSH" et sélectionnez "Utiliser le mot de passe pour l'authentification"
8. Cliquez sur "ENREGISTRER" puis sur "ÉCRIRE"
9. Confirmez l'écrasement de la carte SD et attendez la fin du processus

### 2.2 Premier démarrage

1. Insérez la carte microSD dans le Raspberry Pi
2. Connectez l'alimentation au Raspberry Pi
3. Le système démarre et effectue sa configuration initiale (peut prendre quelques minutes)
4. Une fois sur le bureau, ouvrez un terminal

### 2.3 Mise à jour du système

```bash
# Mettre à jour la liste des paquets
sudo apt update

# Mettre à jour tous les paquets installés
sudo apt full-upgrade -y

# Installer les outils nécessaires
sudo apt install -y git curl wget htop vim nano rsync usbutils
```

### 2.4 Configuration du démarrage depuis le SSD

```bash
# Installer le firmware de démarrage USB
sudo apt install -y rpi-eeprom

# Mettre à jour le firmware
sudo rpi-eeprom-update -a

# Redémarrer pour appliquer les mises à jour
sudo reboot
```

Après le redémarrage, continuez avec les étapes suivantes :

```bash
# Identifier le SSD
lsblk

# Supposons que le SSD est /dev/sda
# Créer une partition sur le SSD
sudo parted /dev/sda mklabel gpt
sudo parted /dev/sda mkpart primary ext4 0% 100%

# Formater la partition
sudo mkfs.ext4 /dev/sda1

# Monter le SSD
sudo mkdir -p /mnt/ssd
sudo mount /dev/sda1 /mnt/ssd

# Copier le système d'exploitation sur le SSD
sudo rsync -axv / /mnt/ssd

# Préparer le SSD pour le démarrage
cd /mnt/ssd
sudo mount --bind /dev dev
sudo mount --bind /sys sys
sudo mount --bind /proc proc
sudo chroot .
echo "PARTUUID=$(blkid -s PARTUUID -o value /dev/sda1) / ext4 defaults,noatime 0 1" > /etc/fstab
exit
sudo umount dev sys proc
cd ~

# Configurer le démarrage depuis USB
sudo raspi-config
# Dans l'interface, allez à "Advanced Options" > "Boot Order" > "USB Boot"
# Sélectionnez "OK" puis "Finish" et redémarrez
```

## 3. Installation des services requis

### 3.1 Installation de Node.js

```bash
# Installer Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier l'installation
node -v
npm -v
```

### 3.2 Installation de MariaDB

```bash
# Installer MariaDB
sudo apt install -y mariadb-server

# Sécuriser l'installation
sudo mysql_secure_installation
# Répondez aux questions comme suit:
# - Entrer le mot de passe actuel pour root: Appuyez sur Entrée (vide par défaut)
# - Définir un mot de passe pour root: Y, puis entrez un mot de passe sécurisé
# - Supprimer les utilisateurs anonymes: Y
# - Interdire la connexion root à distance: Y
# - Supprimer la base de test: Y
# - Recharger les privilèges: Y

# Créer une base de données et un utilisateur pour RaspberryDay
sudo mysql -u root -p
# Entrez le mot de passe root défini précédemment

# Dans la console MariaDB, exécutez:
CREATE DATABASE raspberryday;
CREATE USER 'raspberryday'@'localhost' IDENTIFIED BY 'mot_de_passe_sécurisé';
GRANT ALL PRIVILEGES ON raspberryday.* TO 'raspberryday'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3.3 Installation de Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Activer et démarrer Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Vérifier le statut
sudo systemctl status nginx
```

### 3.4 Configuration de Chromium en mode kiosk

```bash
# Installer Chromium et les dépendances
sudo apt install -y chromium-browser unclutter

# Créer un script de démarrage pour le mode kiosk
cat > ~/kiosk.sh << 'EOF'
#!/bin/bash
xset s off
xset s noblank
xset -dpms

unclutter -idle 0.5 -root &

sed -i 's/"exited_cleanly":false/"exited_cleanly":true/' ~/.config/chromium/Default/Preferences
sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' ~/.config/chromium/Default/Preferences

/usr/bin/chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost
EOF

# Rendre le script exécutable
chmod +x ~/kiosk.sh

# Configurer le démarrage automatique
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/kiosk.desktop << EOF
[Desktop Entry]
Type=Application
Name=Kiosk
Exec=/home/raspberryday/kiosk.sh
X-GNOME-Autostart-enabled=true
EOF
```

### 3.5 Installation de Let's Encrypt (optionnel, pour accès externe)

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Configurer Let's Encrypt (remplacez example.com par votre domaine)
sudo certbot --nginx -d example.com
```

## 4. Installation de l'application RaspberryDay

### 4.1 Cloner le dépôt

```bash
# Créer le répertoire d'application
mkdir -p ~/raspberryday
cd ~/raspberryday

# Cloner le dépôt (à remplacer par l'URL réelle du dépôt)
git clone https://github.com/username/raspberryday.git .
```

### 4.2 Configuration du backend

```bash
# Installer les dépendances
cd ~/raspberryday/backend
npm install

# Créer le fichier de configuration
cp .env.example .env

# Éditer le fichier de configuration
nano .env
```

Modifiez le fichier `.env` avec les informations suivantes :

```
# Configuration de la base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=raspberryday
DB_USER=raspberryday
DB_PASS=mot_de_passe_sécurisé

# Configuration du serveur
PORT=3000
NODE_ENV=production
JWT_SECRET=générez_une_chaîne_aléatoire_longue
MEDIA_STORAGE_PATH=/media/ssd/raspberryday/media

# Configuration des médias
MAX_FILE_SIZE=100000000
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/quicktime
```

### 4.3 Configuration du frontend

```bash
# Installer les dépendances
cd ~/raspberryday/frontend
npm install

# Créer le fichier de configuration
cp .env.example .env

# Éditer le fichier de configuration
nano .env
```

Modifiez le fichier `.env` avec les informations suivantes :

```
VUE_APP_API_URL=http://localhost:3000/api/v1
VUE_APP_WEBSOCKET_URL=ws://localhost:3000
```

### 4.4 Compilation du frontend

```bash
# Compiler le frontend pour la production
cd ~/raspberryday/frontend
npm run build
```

### 4.5 Configuration de Nginx

```bash
# Créer la configuration Nginx pour l'application
sudo nano /etc/nginx/sites-available/raspberryday
```

Ajoutez la configuration suivante :

```nginx
server {
    listen 80;
    server_name localhost;

    root /home/raspberryday/raspberryday/frontend/dist;
    index index.html;

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }

    # Médias
    location /media {
        alias /media/ssd/raspberryday/media;
        expires 1d;
        add_header Cache-Control "public";
    }
}
```

Activez la configuration et redémarrez Nginx :

```bash
sudo ln -s /etc/nginx/sites-available/raspberryday /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

### 4.6 Configuration du service systemd

```bash
# Créer un service systemd pour le backend
sudo nano /etc/systemd/system/raspberryday.service
```

Ajoutez la configuration suivante :

```
[Unit]
Description=RaspberryDay Backend Service
After=network.target mariadb.service

[Service]
Type=simple
User=raspberryday
WorkingDirectory=/home/raspberryday/raspberryday/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=raspberryday
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Activez et démarrez le service :

```bash
sudo systemctl enable raspberryday
sudo systemctl start raspberryday
sudo systemctl status raspberryday
```

### 4.7 Création des répertoires de médias

```bash
# Créer les répertoires pour les médias
sudo mkdir -p /media/ssd/raspberryday/media/{original,optimized,thumbnails,temp}
sudo chown -R raspberryday:raspberryday /media/ssd/raspberryday
```

## 5. Configuration initiale

### 5.1 Création du premier utilisateur administrateur

```bash
# Exécuter le script de création d'administrateur
cd ~/raspberryday/backend
node scripts/create-admin.js
```

Suivez les instructions pour créer un compte administrateur.

### 5.2 Configuration de la télécommande TV (CEC)

```bash
# Installer les outils CEC
sudo apt install -y cec-utils

# Tester la détection CEC
cec-client -l

# Configurer le script de gestion CEC
cat > ~/cec-handler.sh << 'EOF'
#!/bin/bash
echo "Starting CEC handler..."
cec-client | while read line; do
  if [[ $line == *"key pressed: "* ]]; then
    key=$(echo $line | sed 's/.*key pressed: \([^:]*\).*/\1/')
    case $key in
      "up" | "down" | "left" | "right" | "select" | "exit" | "play" | "pause" | "stop")
        echo "CEC key: $key"
        curl -X POST http://localhost:3000/api/v1/tv/remote -H "Content-Type: application/json" -d "{\"key\":\"$key\"}"
        ;;
    esac
  fi
done
EOF

# Rendre le script exécutable
chmod +x ~/cec-handler.sh

# Créer un service systemd pour le gestionnaire CEC
sudo nano /etc/systemd/system/cec-handler.service
```

Ajoutez la configuration suivante :

```
[Unit]
Description=CEC Remote Handler
After=network.target raspberryday.service

[Service]
Type=simple
User=raspberryday
ExecStart=/home/raspberryday/cec-handler.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activez et démarrez le service :

```bash
sudo systemctl enable cec-handler
sudo systemctl start cec-handler
```

### 5.3 Configuration des sauvegardes automatiques

```bash
# Créer un script de sauvegarde
cat > ~/backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/media/ssd/raspberryday/backups"
DB_BACKUP="$BACKUP_DIR/db_$TIMESTAMP.sql"
CONFIG_BACKUP="$BACKUP_DIR/config_$TIMESTAMP.tar.gz"

# Créer le répertoire de sauvegarde s'il n'existe pas
mkdir -p $BACKUP_DIR

# Sauvegarde de la base de données
mysqldump -u raspberryday -p'mot_de_passe_sécurisé' raspberryday > $DB_BACKUP

# Sauvegarde des fichiers de configuration
tar -czf $CONFIG_BACKUP /home/raspberryday/raspberryday/backend/.env /home/raspberryday/raspberryday/frontend/.env /etc/nginx/sites-available/raspberryday

# Supprimer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "db_*.sql" -type f -mtime +30 -delete
find $BACKUP_DIR -name "config_*.tar.gz" -type f -mtime +30 -delete

echo "Backup completed: $(date)"
EOF

# Rendre le script exécutable
chmod +x ~/backup.sh

# Ajouter une tâche cron pour les sauvegardes quotidiennes
(crontab -l 2>/dev/null; echo "0 2 * * * /home/raspberryday/backup.sh >> /home/raspberryday/backup.log 2>&1") | crontab -
```

## 6. Vérification et tests

### 6.1 Vérification des services

```bash
# Vérifier que tous les services sont en cours d'exécution
sudo systemctl status nginx
sudo systemctl status mariadb
sudo systemctl status raspberryday
sudo systemctl status cec-handler
```

### 6.2 Test de l'application

1. Ouvrez un navigateur sur un autre appareil et accédez à `http://<adresse_ip_du_raspberry_pi>`
2. Connectez-vous avec les identifiants administrateur créés précédemment
3. Vérifiez que vous pouvez accéder à l'interface d'administration
4. Testez l'envoi d'un média
5. Vérifiez que le média s'affiche correctement sur le téléviseur

### 6.3 Test de la télécommande

1. Utilisez la télécommande du téléviseur pour naviguer dans l'interface
2. Vérifiez que les boutons directionnels, OK, retour, lecture/pause fonctionnent correctement

## 7. Dépannage

### 7.1 Problèmes de démarrage

Si le système ne démarre pas depuis le SSD :
```bash
# Vérifier les journaux de démarrage
sudo dmesg | grep -i sda

# Vérifier que le SSD est correctement monté
lsblk

# Vérifier la configuration de démarrage
sudo raspi-config
```

### 7.2 Problèmes de services

Si un service ne démarre pas :
```bash
# Vérifier les journaux du service
sudo journalctl -u raspberryday -n 50

# Redémarrer le service
sudo systemctl restart raspberryday
```

### 7.3 Problèmes de réseau

Si l'application n'est pas accessible :
```bash
# Vérifier l'adresse IP
hostname -I

# Vérifier que Nginx écoute sur le port 80
sudo netstat -tuln | grep 80

# Vérifier les journaux Nginx
sudo tail -n 50 /var/log/nginx/error.log
```

### 7.4 Problèmes de CEC

Si la télécommande ne fonctionne pas :
```bash
# Vérifier que CEC est détecté
cec-client -l

# Vérifier les journaux du gestionnaire CEC
sudo journalctl -u cec-handler -n 50

# Redémarrer le service CEC
sudo systemctl restart cec-handler
```

## 8. Maintenance

### 8.1 Mises à jour du système

```bash
# Mettre à jour le système
sudo apt update
sudo apt full-upgrade -y
sudo reboot
```

### 8.2 Mises à jour de l'application

```bash
# Mettre à jour l'application
cd ~/raspberryday
git pull

# Mettre à jour les dépendances backend
cd backend
npm install

# Mettre à jour les dépendances frontend et recompiler
cd ../frontend
npm install
npm run build

# Redémarrer le service
sudo systemctl restart raspberryday
```

### 8.3 Surveillance de l'espace disque

```bash
# Vérifier l'utilisation de l'espace disque
df -h

# Nettoyer les fichiers temporaires si nécessaire
rm -rf ~/raspberryday/backend/temp/*
```

## 9. Ressources additionnelles

- [Documentation officielle Raspberry Pi](https://www.raspberrypi.org/documentation/)
- [Documentation Node.js](https://nodejs.org/en/docs/)
- [Documentation MariaDB](https://mariadb.com/kb/en/documentation/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Documentation CEC](https://www.cec-o-matic.com/)

## 10. Conclusion

Félicitations ! Vous avez maintenant un système RaspberryDay fonctionnel. Vous pouvez commencer à partager des photos et vidéos avec votre famille sur votre téléviseur. N'hésitez pas à explorer les fonctionnalités avancées et à personnaliser le système selon vos besoins.