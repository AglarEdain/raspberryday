#!/bin/bash

# Script d'installation et configuration initiale pour Raspberry Pi - RaspberryDay

set -e

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Chromium
sudo apt install -y chromium-browser

# Installation des outils pour la gestion de la télécommande (exemple: lirc)
sudo apt install -y lirc

# Configuration du montage du SSD externe (exemple)
SSD_DEVICE="/dev/sda1"
MOUNT_POINT="/mnt/ssd"

if ! grep -qs "$MOUNT_POINT" /proc/mounts; then
  sudo mkdir -p $MOUNT_POINT
  sudo mount $SSD_DEVICE $MOUNT_POINT
fi

# Configuration du démarrage automatique de Chromium en mode kiosk
AUTOSTART_FILE="$HOME/.config/lxsession/LXDE-pi/autostart"
mkdir -p $(dirname $AUTOSTART_FILE)

cat <<EOF > $AUTOSTART_FILE
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --noerrdialogs --kiosk http://localhost:3000/tv
EOF

# Message de fin
 echo "Configuration initiale terminée. Redémarrez le Raspberry Pi."