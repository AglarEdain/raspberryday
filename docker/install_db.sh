#!/bin/sh

# Script d'installation et peuplement de la base de données dans le container mariadb

CONTAINER_NAME="docker-mariadb-1"
DB_NAME=raspberryday
DB_USER=root
DB_PASSWORD=example

# Copier le script SQL dans le container
# (optionnel si le fichier est déjà accessible dans un volume partagé)
# docker cp init_db.sql $CONTAINER_NAME:/init_db.sql

# Exécuter le script SQL dans le container

docker exec -i $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < ./init_db.sql

# Note : le chemin /docker/init_db.sql doit être accessible dans le container, sinon adapter la commande docker cp ci-dessus
