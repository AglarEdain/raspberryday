# Spécifications de l'API - Projet RaspberryDay

## Vue d'ensemble

L'API RaspberryDay est le cœur du système, permettant la communication entre les différents composants (application mobile, interface TV, administration). Cette API RESTful est développée avec Node.js et Express.js, offrant des endpoints sécurisés pour la gestion des médias, des utilisateurs et des paramètres système.

## Spécifications techniques

- **Protocole**: HTTPS
- **Format**: JSON
- **Authentification**: JWT (JSON Web Tokens)
- **Version**: v1
- **Base URL**: `https://{hostname}/api/v1`

## Endpoints

### Authentification

#### Connexion utilisateur

```
POST /auth/login
```

**Corps de la requête**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Réponse (200 OK)**:
```json
{
  "token": "string",
  "user": {
    "id": "integer",
    "username": "string",
    "display_name": "string",
    "role": "string"
  }
}
```

#### Vérification du token

```
GET /auth/verify
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Réponse (200 OK)**:
```json
{
  "valid": true,
  "user": {
    "id": "integer",
    "username": "string",
    "display_name": "string",
    "role": "string"
  }
}
```

### Gestion des médias

#### Récupération des médias

```
GET /media
```

**Paramètres de requête**:
```
page: integer (défaut: 1)
limit: integer (défaut: 20)
category_id: integer (optionnel)
user_id: integer (optionnel)
sort: string (défaut: "created_at:desc")
```

**Réponse (200 OK)**:
```json
{
  "data": [
    {
      "id": "integer",
      "filename": "string",
      "original_name": "string",
      "type": "string",
      "size": "integer",
      "caption": "string",
      "category": {
        "id": "integer",
        "name": "string"
      },
      "user": {
        "id": "integer",
        "display_name": "string"
      },
      "created_at": "datetime",
      "updated_at": "datetime",
      "urls": {
        "thumbnail": "string",
        "optimized": "string",
        "original": "string"
      }
    }
  ],
  "pagination": {
    "total": "integer",
    "page": "integer",
    "limit": "integer",
    "pages": "integer"
  }
}
```

#### Téléchargement d'un média

```
POST /media/upload
```

**En-têtes**:
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Corps de la requête**:
```
file: File (required)
caption: string (optional)
category_id: integer (optional)
immediate_display: boolean (optional, default: false)
```

**Réponse (201 Created)**:
```json
{
  "id": "integer",
  "filename": "string",
  "original_name": "string",
  "type": "string",
  "size": "integer",
  "caption": "string",
  "category": {
    "id": "integer",
    "name": "string"
  },
  "created_at": "datetime",
  "urls": {
    "thumbnail": "string",
    "optimized": "string",
    "original": "string"
  }
}
```

#### Récupération d'un média spécifique

```
GET /media/{id}
```

**Réponse (200 OK)**:
```json
{
  "id": "integer",
  "filename": "string",
  "original_name": "string",
  "type": "string",
  "size": "integer",
  "caption": "string",
  "category": {
    "id": "integer",
    "name": "string"
  },
  "user": {
    "id": "integer",
    "display_name": "string"
  },
  "created_at": "datetime",
  "updated_at": "datetime",
  "urls": {
    "thumbnail": "string",
    "optimized": "string",
    "original": "string"
  }
}
```

#### Mise à jour d'un média

```
PUT /media/{id}
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "caption": "string",
  "category_id": "integer",
  "is_favorite": "boolean"
}
```

**Réponse (200 OK)**:
```json
{
  "id": "integer",
  "caption": "string",
  "category": {
    "id": "integer",
    "name": "string"
  },
  "is_favorite": "boolean",
  "updated_at": "datetime"
}
```

#### Suppression d'un média

```
DELETE /media/{id}
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Réponse (204 No Content)**

### Gestion des catégories

#### Récupération des catégories

```
GET /categories
```

**Réponse (200 OK)**:
```json
{
  "data": [
    {
      "id": "integer",
      "name": "string",
      "description": "string",
      "media_count": "integer",
      "created_at": "datetime",
      "updated_at": "datetime"
    }
  ]
}
```

#### Création d'une catégorie

```
POST /categories
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "name": "string",
  "description": "string"
}
```

**Réponse (201 Created)**:
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "created_at": "datetime"
}
```

### Interface TV

#### Récupération de la file d'affichage

```
GET /tv/queue
```

**Réponse (200 OK)**:
```json
{
  "current": {
    "id": "integer",
    "media": {
      "id": "integer",
      "type": "string",
      "caption": "string",
      "urls": {
        "optimized": "string"
      },
      "user": {
        "display_name": "string"
      },
      "created_at": "datetime"
    }
  },
  "next": [
    {
      "id": "integer",
      "media": {
        "id": "integer",
        "type": "string",
        "urls": {
          "thumbnail": "string"
        }
      }
    }
  ],
  "settings": {
    "transition_time": "integer",
    "display_captions": "boolean",
    "display_user": "boolean",
    "display_date": "boolean"
  }
}
```

#### Notification de nouveaux médias (WebSocket)

```
WS /tv/notifications
```

**Message reçu (exemple)**:
```json
{
  "type": "new_media",
  "data": {
    "id": "integer",
    "user": {
      "display_name": "string"
    },
    "type": "string",
    "thumbnail_url": "string"
  }
}
```

### Gestion des utilisateurs

#### Récupération des utilisateurs

```
GET /users
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Réponse (200 OK)**:
```json
{
  "data": [
    {
      "id": "integer",
      "username": "string",
      "display_name": "string",
      "email": "string",
      "role": "string",
      "created_at": "datetime",
      "updated_at": "datetime",
      "media_count": "integer"
    }
  ]
}
```

#### Création d'un utilisateur

```
POST /users
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "username": "string",
  "password": "string",
  "display_name": "string",
  "email": "string",
  "role": "string"
}
```

**Réponse (201 Created)**:
```json
{
  "id": "integer",
  "username": "string",
  "display_name": "string",
  "email": "string",
  "role": "string",
  "created_at": "datetime"
}
```

### Paramètres système

#### Récupération des paramètres

```
GET /settings
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Réponse (200 OK)**:
```json
{
  "display": {
    "transition_time": "integer",
    "display_captions": "boolean",
    "display_user": "boolean",
    "display_date": "boolean",
    "screensaver_timeout": "integer"
  },
  "storage": {
    "auto_cleanup": "boolean",
    "cleanup_days": "integer",
    "max_file_size": "integer"
  },
  "system": {
    "hostname": "string",
    "https_enabled": "boolean",
    "auto_update": "boolean"
  }
}
```

#### Mise à jour des paramètres

```
PUT /settings
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "key": "string",
  "value": "any"
}
```

**Réponse (200 OK)**:
```json
{
  "key": "string",
  "value": "any",
  "updated_at": "datetime"
}
```

### Surveillance système

#### État du système

```
GET /system/status
```

**En-têtes**:
```
Authorization: Bearer {token}
```

**Réponse (200 OK)**:
```json
{
  "uptime": "integer",
  "cpu_usage": "float",
  "memory": {
    "total": "integer",
    "used": "integer",
    "free": "integer"
  },
  "storage": {
    "total": "integer",
    "used": "integer",
    "free": "integer"
  },
  "temperature": "float",
  "services": {
    "nginx": "string",
    "node": "string",
    "mariadb": "string"
  }
}
```

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource non trouvée |
| 409 | Conflit |
| 413 | Fichier trop volumineux |
| 415 | Type de média non supporté |
| 422 | Entité non traitable |
| 429 | Trop de requêtes |
| 500 | Erreur serveur interne |
| 503 | Service indisponible |

## Sécurité

- Tous les endpoints (sauf explicitement mentionnés) nécessitent une authentification
- Les tokens JWT expirent après 24 heures
- Rate limiting pour prévenir les attaques par force brute
- Validation des entrées pour prévenir les injections
- Sanitization des sorties pour prévenir les attaques XSS
- En-têtes de sécurité (HSTS, CSP, X-Content-Type-Options, etc.)

## Versionnement

L'API suit le versionnement sémantique (SemVer). Les changements majeurs qui cassent la compatibilité seront signalés par un changement de version dans l'URL de base.