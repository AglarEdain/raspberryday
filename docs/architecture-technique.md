# Architecture Technique - Projet RaspberryDay

## Vue d'ensemble

RaspberryDay est une solution open source permettant le partage simplifié de photos et vidéos familiales sur un téléviseur, principalement destinée aux personnes peu familières avec la technologie. Ce document détaille les choix techniques et l'architecture du système.

## Choix techniques

### Matériel

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Ordinateur principal | Raspberry Pi 5 (8GB RAM) | Performances supérieures pour le traitement vidéo et le multitâche |
| Stockage | SSD externe 1TB (Samsung T7) | Rapidité d'accès, durabilité et capacité suffisante pour stocker de nombreux médias |
| Connectivité | Wi-Fi intégré + Ethernet | Flexibilité d'installation et fiabilité de connexion |
| Affichage | HDMI vers TV | Standard universel compatible avec toutes les TV modernes |
| Contrôle | CEC HDMI pour télécommande TV | Utilisation de la télécommande existante de la TV |

### Logiciels

| Composant | Choix | Justification |
|-----------|-------|---------------|
| OS | Raspberry Pi OS 64-bit (Bookworm) | Support officiel, stabilité et performances optimisées |
| Backend | Node.js (v18 LTS) | Performances asynchrones idéales pour servir des médias, large écosystème |
| Base de données | MariaDB 10.11 | Performances, fiabilité et compatibilité SQL |
| Serveur web | Nginx | Performances, capacité de proxy inverse et gestion efficace des fichiers statiques |
| Frontend TV | Application web Vue.js 3 | Réactivité, performances et facilité de développement |
| Frontend Mobile | PWA avec Vue.js 3 | Réutilisation du code, installation sur écran d'accueil, expérience native |
| Sécurité | HTTPS avec Let's Encrypt | Chiffrement gratuit et automatisé |

## Architecture du système

```
┌─────────────────────────────────────────────────────────────────┐
│                      Raspberry Pi 5 (8GB)                       │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │ Nginx       │◄──►│ Node.js API │◄──►│ MariaDB             │  │
│  │ (Serveur Web│    │ (Backend)   │    │ (Base de données)   │  │
│  │ et Proxy)   │    │             │    │                     │  │
│  └─────┬───────┘    └─────────────┘    └─────────────────────┘  │
│        │                  ▲                       ▲              │
│        │                  │                       │              │
│        ▼                  │                       │              │
│  ┌─────────────┐          │                       │              │
│  │ Frontend TV │          │                       │              │
│  │ (Chromium   │          │                       │              │
│  │ Kiosk Mode) │          │                       │              │
│  └─────────────┘          │                       │              │
│                           │                       │              │
└───────────────────────────┼───────────────────────┼──────────────┘
                            │                       │               
                            │                       │               
                ┌───────────┴───────────┐           │               
                │ PWA Mobile            │           │               
                │ (Smartphones)         │           │               
                └───────────────────────┘           │               
                            ▲                       │               
                            │                       │               
                ┌───────────┴───────────┐           │               
                │ Interface Admin       ├───────────┘               
                │ (Gestion système)     │                           
                └───────────────────────┘                           
```

## Flux de données

1. **Envoi de médias**:
   - L'utilisateur sélectionne/capture des médias via la PWA mobile
   - Les médias sont compressés côté client si nécessaire
   - Envoi au serveur Node.js via API REST sécurisée
   - Le serveur traite, optimise et stocke les médias sur le SSD
   - Les métadonnées sont enregistrées dans MariaDB

2. **Affichage sur TV**:
   - L'application frontend TV interroge périodiquement l'API
   - Les nouveaux médias sont signalés et chargés
   - L'affichage se fait selon les paramètres configurés (diaporama, etc.)
   - Les interactions via télécommande sont capturées par CEC HDMI

3. **Administration**:
   - Interface web dédiée pour la gestion du système
   - Accès sécurisé par authentification
   - Gestion des utilisateurs, médias et paramètres d'affichage

## Stockage des données

### Structure de la base de données

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│ Users          │       │ Media          │       │ Categories     │
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
                         └────────────────┘

┌────────────────┐       ┌────────────────┐
│ Settings       │       │ DisplayQueue   │
├────────────────┤       ├────────────────┤
│ id             │       │ id             │
│ key            │       │ media_id       │
│ value          │       │ scheduled_time │
│ description    │       │ displayed      │
│ updated_at     │       │ display_time   │
└────────────────┘       └────────────────┘
```

### Organisation des fichiers

```
/media/
  ├── thumbnails/       # Miniatures optimisées
  ├── optimized/        # Médias redimensionnés pour affichage TV
  ├── original/         # Fichiers originaux (accès restreint)
  └── temp/             # Stockage temporaire pendant traitement
```

## Sécurité

- **Authentification**: JWT (JSON Web Tokens) avec expiration
- **Autorisation**: RBAC (Role-Based Access Control)
- **Communication**: HTTPS avec TLS 1.3
- **Stockage**: Chiffrement des mots de passe avec bcrypt
- **Protection**: Validation des entrées, protection CSRF, en-têtes de sécurité

## Performances

- Mise en cache des médias fréquemment affichés
- Optimisation des images et vidéos selon le dispositif d'affichage
- Chargement progressif et lazy loading des médias
- Indexation de la base de données pour des requêtes rapides
- Compression gzip/brotli pour les assets web

## Haute disponibilité

- Sauvegarde automatique quotidienne de la base de données
- Journalisation des erreurs et événements système
- Surveillance des ressources système (CPU, mémoire, espace disque)
- Redémarrage automatique des services en cas de défaillance