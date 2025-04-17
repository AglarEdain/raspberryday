# Cahier des charges : RaspberryDay, Alternative open source à la Sunday Box sur Raspberry Pi

## 1. Présentation du projet

### 1.1 Contexte
Suite à la disparition du service commercial Sunday Box, ce projet vise à recréer un système similaire en utilisant un Raspberry Pi comme alternative open source. Le système permettra le partage simplifié de photos et vidéos familiales sur un téléviseur, principalement destiné aux personnes peu familières avec la technologie.

### 1.2 Objectifs
- Créer une solution simple permettant aux membres de la famille d'envoyer des médias depuis leurs smartphones
- Afficher automatiquement ces médias sur un téléviseur via un Raspberry Pi
- Garantir une expérience utilisateur intuitive, particulièrement pour les seniors
- Développer une solution entièrement open source et auto-hébergée

## 2. Architecture technique

### 2.1 Matériel requis
- Raspberry Pi 5 (recommandé pour les performances vidéo) ou Pi 4 (8GB)
- SSD externe (recommandé pour les performances et la durabilité)
- Boîtier pour Raspberry Pi
- Câble HDMI
- Adaptateur secteur
- Télécommande de télévision (pour contrôler le défilement et la navigation)

### 2.2 Logiciels et technologies
- Système d'exploitation : Raspberry Pi OS (64-bit)
- Backend serveur central : Node.js ou PHP
- Base de données : MariaDB
- Frontend TV : Chromium en mode kiosk (HTML5/CSS/JavaScript)
- Application mobile : Progressive Web App (PWA) pour accès smartphone
- Protocoles de communication : HTTPS, WebSockets pour notifications en temps réel
- Stockage : Local sur SSD connecté au Raspberry Pi

## 3. Fonctionnalités principales

### 3.1 Interface téléviseur
- Démarrage automatique de Chromium en mode kiosk au lancement du Raspberry Pi
- Affichage des médias en mode diaporama/galerie
- Organisation chronologique des médias
- Notifications visuelles lors de la réception de nouveaux médias
- Navigation simplifiée utilisant la télécommande de la télévision pour:
  - Contrôler le défilement des médias
  - Passer à l'image suivante/précédente
  - Accéder aux fonctions principales

### 3.2 Application mobile (PWA)
- Progressive Web App (PWA) comme point d'entrée pour les smartphones
- Authentification simplifiée des membres de la famille
- Interface permettant de prendre/sélectionner des photos/vidéos
- Ajout de légendes et commentaires aux médias
- Catégorisation des médias (événements, vacances, etc.)
- Notifications de confirmation d'envoi
- Option de diffusion immédiate ou programmée
- Installation possible sur l'écran d'accueil des smartphones

### 3.3 Administration
- Interface web d'administration
- Gestion des utilisateurs et permissions
- Configuration des paramètres d'affichage
- Modération des contenus si nécessaire
- Monitoring de l'espace disque et autres ressources

## 4. Spécifications techniques détaillées

### 4.1 Architecture client-serveur
- Serveur central:
  - Backend développé en Node.js ou PHP
  - Base de données MariaDB pour le stockage des métadonnées
  - API RESTful pour l'envoi et la récupération des médias
  - Système d'authentification sécurisé (JWT)
  - Optimisation/redimensionnement automatique des images et vidéos
  - Service de notification en temps réel
  - Système de fichiers organisé par date/catégorie
  - Mécanisme de suppression automatique des anciens médias selon règles définies

- Client Raspberry Pi:
  - Communication avec le serveur central via API
  - Stockage local sur SSD pour les performances et la fiabilité
  - Chromium en mode kiosk pour l'affichage des médias
  - Gestion des entrées de la télécommande TV

### 4.2 Frontend TV (Chromium)
- Chromium en mode kiosk pour affichage plein écran
- Interface épurée adaptée à une visualisation à distance
- Transitions fluides entre les médias
- Rotation des médias avec temporisation configurable
- Mode économiseur d'écran/veille programmable
- Affichage des métadonnées (expéditeur, date, légende)
- Gestion des événements de la télécommande TV:
  - Boutons directionnels pour la navigation
  - Boutons OK/Entrée pour la sélection
  - Boutons précédent/suivant pour changer de média
  - Boutons de volume pour contrôler les médias avec son

### 4.3 Application mobile (PWA)
- Progressive Web App (PWA) hébergée sur le serveur central
- Installation sur l'écran d'accueil des smartphones (iOS/Android)
- Design responsive adapté à différents appareils
- Compression des médias avant envoi
- Mode hors-ligne avec synchronisation ultérieure
- Prévisualisation des médias avant envoi
- Historique des envois
- Notifications push pour les confirmations et événements

## 5. Sécurité et confidentialité

### 5.1 Sécurité
- Communications chiffrées (HTTPS)
- Certificats auto-signés ou Let's Encrypt
- Authentification à deux facteurs (optionnel)
- Mises à jour automatiques ou assistées
- Sauvegarde régulière des données

### 5.2 Confidentialité
- Stockage local des données (pas de cloud tiers)
- Aucune collecte de données non nécessaire
- Conformité RGPD (pour l'UE)
- Options de suppression définitive des médias

## 6. Installation et configuration

### 6.1 Prérequis réseau
- Connexion internet pour le Raspberry Pi
- Idéalement une adresse IP fixe locale
- Configuration possible du port forwarding pour accès externe
- Configuration possible d'un nom de domaine dynamique (DDNS)

### 6.2 Processus d'installation
- Image préconfigurée à flasher sur la carte SD pour le démarrage initial
- Configuration du démarrage depuis le SSD externe pour de meilleures performances
- Installation et configuration automatisée de Chromium en mode kiosk
- Configuration de MariaDB sur le serveur central
- Script d'installation automatisé pour le serveur Node.js/PHP
- Assistant de configuration initiale pour la connexion client-serveur
- Documentation détaillée et guide de dépannage
- Configuration de la gestion des entrées de la télécommande TV

## 7. Évolutions possibles

### 7.1 Fonctionnalités additionnelles
- Support d'appels vidéo simplifiés
- Intégration de calendriers partagés (anniversaires, événements)
- Support de messages textuels et vocaux
- Thèmes et personnalisation visuelle
- Intégration de contenus provenant d'autres sources (météo, actualités)

### 7.2 Extensions matérielles
- Amélioration de la prise en charge des télécommandes TV:
  - Support de télécommandes spécifiques avec plus de fonctionnalités
  - Personnalisation avancée des mappings de boutons
  - Création d'une télécommande virtuelle sur smartphone via la PWA
- Support de boutons physiques dédiés
- Compatibilité avec écrans tactiles
- Option d'impression des photos favorites
- Support de caméras/microphones pour communication bidirectionnelle
- Optimisation des performances avec différents modèles de SSD

## 8. Documentation et support

### 8.1 Documentation technique
- Guide d'installation détaillé:
  - Configuration du serveur Node.js/PHP avec MariaDB
  - Installation et optimisation de Chromium sur Raspberry Pi
  - Configuration du démarrage depuis SSD
  - Mise en place de la PWA pour smartphones
- Documentation API pour développeurs
- Guide d'intégration de la télécommande TV
- Code commenté et structuré
- Exemples d'utilisation et cas pratiques
- Tutoriels de déploiement pour différentes configurations

### 8.2 Documentation utilisateur
- Guide simplifié d'utilisation (PDF imprimable):
  - Utilisation de la télécommande TV pour naviguer dans l'interface
  - Installation et utilisation de la PWA sur smartphone
  - Envoi de photos et vidéos depuis le smartphone
- Tutoriels vidéo démontrant les fonctionnalités principales
- Guide d'installation de la PWA sur différents appareils
- FAQ et solutions aux problèmes courants
- Ressources communautaires (forum, wiki)
- Guide de dépannage pour les problèmes de connexion client-serveur

## 9. Licence et communauté

### 9.1 Licence
- Projet sous licence open source (GPL v3 ou MIT)
- Documentation sous licence Creative Commons
- Attributions claires pour les bibliothèques tierces utilisées

### 9.2 Contribution communautaire
- Code source disponible sur GitHub ou GitLab
- Guide de contribution
- Processus de revue des pull requests
- Système de rapports de bugs

## 10. Planning de développement suggéré

### Phase 1 : Fondations (4-6 semaines)
- Mise en place de l'environnement de développement
- Configuration du serveur central avec Node.js/PHP et MariaDB
- Développement de l'API de communication client-serveur
- Configuration du Raspberry Pi avec SSD et Chromium
- Développement de l'interface TV minimale fonctionnelle
- Implémentation de base de la gestion de la télécommande TV

### Phase 2 : Fonctionnalités principales (4-6 semaines)
- Développement de la PWA pour smartphones
- Optimisation des performances du système client-serveur
- Amélioration de l'interface utilisateur TV et mobile
- Implémentation complète des contrôles via télécommande
- Sécurisation du système
- Tests avec utilisateurs cibles

### Phase 3 : Finalisation (2-4 semaines)
- Documentation complète (technique et utilisateur)
- Création de l'image préconfigurée pour Raspberry Pi
- Optimisation des performances avec SSD
- Tests de robustesse et stabilité
- Préparation au déploiement
- Formation des utilisateurs à l'utilisation de la télécommande et de la PWA
