# Sécurité et Confidentialité - Projet RaspberryDay

## Introduction

Ce document définit les exigences et les mesures de sécurité et de confidentialité pour le projet RaspberryDay. L'objectif est de garantir la protection des données personnelles des utilisateurs, la sécurité du système et la conformité aux réglementations en vigueur, tout en maintenant une expérience utilisateur fluide.

## Principes fondamentaux

### Confidentialité par conception (Privacy by Design)

Le projet RaspberryDay adopte une approche de "confidentialité par conception" avec les principes suivants :

1. **Minimisation des données** : Collecter uniquement les données nécessaires au fonctionnement du service
2. **Contrôle utilisateur** : Donner aux utilisateurs le contrôle sur leurs données
3. **Transparence** : Communiquer clairement sur les données collectées et leur utilisation
4. **Sécurité de bout en bout** : Protéger les données à chaque étape du traitement
5. **Respect de la vie privée** : Considérer la vie privée comme paramètre par défaut

### Sécurité par défaut (Security by Default)

Le système est conçu avec une approche "sécurité par défaut" :

1. **Principe du moindre privilège** : Accorder uniquement les permissions minimales nécessaires
2. **Défense en profondeur** : Mettre en place plusieurs couches de sécurité
3. **Sécurité proactive** : Anticiper et prévenir les menaces potentielles
4. **Mises à jour régulières** : Maintenir le système à jour pour corriger les vulnérabilités
5. **Surveillance continue** : Détecter rapidement les incidents de sécurité

## Exigences de sécurité

### Authentification

#### Gestion des identités

- **Identifiants uniques** : Chaque utilisateur dispose d'un identifiant unique
- **Mots de passe robustes** : Exigence de mots de passe forts (minimum 8 caractères, combinaison de lettres, chiffres et caractères spéciaux)
- **Stockage sécurisé** : Hachage des mots de passe avec bcrypt (coût minimum de 12)
- **Verrouillage de compte** : Limitation des tentatives de connexion (5 tentatives maximum avant verrouillage temporaire)

#### Mécanismes d'authentification

- **JWT (JSON Web Tokens)** : Utilisés pour l'authentification API
- **Durée de validité limitée** : Expiration des tokens après 24 heures
- **Rotation des tokens** : Mécanisme de rafraîchissement sécurisé
- **Révocation des sessions** : Possibilité d'invalider toutes les sessions actives

### Autorisation

- **RBAC (Role-Based Access Control)** : Contrôle d'accès basé sur les rôles (admin, user, guest)
- **Vérification systématique** : Contrôle des permissions à chaque requête API
- **Séparation des privilèges** : Distinction claire entre les opérations de lecture et d'écriture
- **Journalisation des accès** : Enregistrement des accès aux ressources sensibles

### Communication sécurisée

- **HTTPS obligatoire** : Toutes les communications chiffrées avec TLS 1.2+
- **Certificats** : Utilisation de Let's Encrypt pour les certificats SSL/TLS
- **En-têtes de sécurité** : Configuration des en-têtes HTTP de sécurité
  - Strict-Transport-Security (HSTS)
  - Content-Security-Policy (CSP)
  - X-Content-Type-Options
  - X-Frame-Options
  - Referrer-Policy
- **Sécurité WebSocket** : Communications WebSocket chiffrées (WSS)

### Sécurité des données

- **Chiffrement au repos** : Protection des données sensibles stockées
- **Chiffrement en transit** : Protection des données pendant la transmission
- **Sauvegarde chiffrée** : Chiffrement des sauvegardes de la base de données
- **Isolation des données** : Séparation logique des données utilisateur

### Protection contre les attaques courantes

- **Injection SQL** : Utilisation de requêtes préparées et ORM
- **XSS (Cross-Site Scripting)** : Échappement des sorties et Content-Security-Policy
- **CSRF (Cross-Site Request Forgery)** : Tokens anti-CSRF pour les formulaires
- **Clickjacking** : En-têtes X-Frame-Options et frame-ancestors CSP
- **Attaques par force brute** : Limitation de débit (rate limiting) et verrouillage de compte
- **Attaques par déni de service** : Limitation de débit au niveau de Nginx

### Sécurité des fichiers

- **Validation des types MIME** : Vérification du type réel des fichiers téléchargés
- **Limitation de taille** : Restriction de la taille maximale des fichiers (100 MB par défaut)
- **Scan antivirus** : Analyse des fichiers téléchargés (ClamAV)
- **Noms de fichiers aléatoires** : Génération de noms de fichiers uniques pour éviter les conflits
- **Isolation du stockage** : Séparation des fichiers originaux et des versions optimisées

## Confidentialité et protection des données

### Données personnelles traitées

| Catégorie | Données | Finalité | Base légale | Durée de conservation |
|-----------|---------|----------|------------|------------------------|
| Identification | Nom d'utilisateur, adresse email | Authentification, communication | Intérêt légitime | Durée du compte |
| Contenu | Photos, vidéos, légendes | Affichage sur TV | Consentement | Selon paramètres utilisateur |
| Métadonnées | Date d'envoi, type de média | Organisation du contenu | Intérêt légitime | Liée au contenu |
| Technique | Adresse IP, logs de connexion | Sécurité, débogage | Intérêt légitime | 30 jours maximum |

### Droits des utilisateurs

Le système permet aux utilisateurs d'exercer leurs droits conformément au RGPD :

- **Droit d'accès** : Interface pour consulter toutes les données personnelles
- **Droit de rectification** : Modification des informations de profil
- **Droit à l'effacement** : Suppression du compte et des données associées
- **Droit à la limitation** : Désactivation temporaire du compte
- **Droit à la portabilité** : Export des données au format JSON/ZIP
- **Droit d'opposition** : Paramètres de confidentialité configurables

### Mesures de protection

- **Minimisation des données** : Collecte limitée aux données strictement nécessaires
- **Pseudonymisation** : Option d'utilisation de pseudonymes pour l'affichage
- **Contrôles d'accès** : Restrictions d'accès aux données personnelles
- **Consentement explicite** : Demande claire pour le traitement des données
- **Transparence** : Politique de confidentialité claire et accessible

## Conformité réglementaire

### RGPD (Règlement Général sur la Protection des Données)

- **Base juridique** : Identification claire de la base juridique pour chaque traitement
- **Registre des traitements** : Documentation des activités de traitement
- **Analyse d'impact** : Évaluation des risques pour les droits et libertés
- **Notification de violation** : Procédure de notification en cas de fuite de données
- **Privacy by Design** : Intégration de la protection des données dès la conception

### Autres réglementations

- **ePrivacy** : Gestion des cookies et technologies similaires
- **CCPA/CPRA** (si applicable) : Respect des exigences californiennes
- **Lois locales** : Adaptation aux réglementations spécifiques selon le déploiement

## Gestion des incidents de sécurité

### Détection

- **Surveillance système** : Monitoring des ressources et services
- **Analyse des logs** : Examen régulier des journaux d'activité
- **Alertes automatisées** : Notification en cas d'activité suspecte
- **Tests de pénétration** : Vérification périodique des vulnérabilités

### Réponse aux incidents

1. **Identification** : Déterminer la nature et l'étendue de l'incident
2. **Confinement** : Limiter l'impact de l'incident
3. **Éradication** : Éliminer la cause de l'incident
4. **Récupération** : Restaurer les systèmes et les données
5. **Analyse post-incident** : Tirer les leçons pour améliorer la sécurité

### Plan de communication

- **Notification interne** : Procédure d'escalade au sein de l'équipe
- **Notification externe** : Communication avec les utilisateurs affectés
- **Notification aux autorités** : Information des autorités compétentes si nécessaire (CNIL)
- **Transparence** : Communication claire sur les mesures prises

## Mesures techniques spécifiques

### Sécurité du Raspberry Pi

- **Mise à jour automatique** : Application régulière des mises à jour de sécurité
- **Pare-feu** : Configuration de règles UFW restrictives
- **SSH sécurisé** : Authentification par clé, désactivation de l'accès root
- **Services minimaux** : Exécution uniquement des services nécessaires
- **Utilisateur dédié** : Compte spécifique avec privilèges limités pour l'application

### Sécurité réseau

- **Segmentation** : Isolation du Raspberry Pi sur le réseau local
- **Accès externe sécurisé** : VPN ou HTTPS avec authentification forte
- **Filtrage des ports** : Exposition minimale des services
- **Protection DoS** : Configuration de fail2ban pour bloquer les attaques
- **Surveillance réseau** : Détection des comportements anormaux

### Sécurité des applications

- **Dépendances sécurisées** : Vérification des vulnérabilités avec npm audit
- **Validation des entrées** : Contrôle strict de toutes les entrées utilisateur
- **Gestion des erreurs** : Messages d'erreur génériques sans information sensible
- **Journalisation sécurisée** : Logs sans données sensibles
- **Tests de sécurité** : Intégration de tests de sécurité automatisés

## Audit et conformité

### Audits de sécurité

- **Audit initial** : Évaluation complète avant le déploiement
- **Audits périodiques** : Vérification trimestrielle de la sécurité
- **Scan de vulnérabilités** : Analyse mensuelle des composants
- **Tests d'intrusion** : Simulation d'attaques pour identifier les faiblesses

### Documentation de sécurité

- **Politique de sécurité** : Document définissant les principes et exigences
- **Procédures opérationnelles** : Instructions détaillées pour les administrateurs
- **Guide de sécurité utilisateur** : Bonnes pratiques pour les utilisateurs
- **Registre des risques** : Identification et évaluation des risques de sécurité

## Implémentation technique

### Authentification et autorisation

```javascript
// Exemple de middleware d'authentification JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  
  const token = authHeader.split(' ')[1];
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
    
    req.user = user;
    next();
  });
};

// Exemple de middleware d'autorisation basée sur les rôles
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    next();
  };
};
```

### Configuration HTTPS avec Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    
    # Paramètres SSL optimisés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' wss://example.com; frame-ancestors 'self'; form-action 'self';" always;
    
    # Protection contre les attaques par force brute
    limit_req zone=login burst=5 nodelay;
    limit_req_status 429;
    
    # Le reste de la configuration...
}
```

### Validation et sécurisation des fichiers téléchargés

```javascript
// Middleware de validation des fichiers
const validateFileUpload = (req, res, next) => {
  // Vérifier si un fichier est présent
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier fourni' });
  }
  
  // Vérifier la taille du fichier
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 100000000; // 100MB par défaut
  if (req.file.size > maxSize) {
    return res.status(413).json({ message: 'Fichier trop volumineux' });
  }
  
  // Vérifier le type MIME
  const allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,video/mp4,video/quicktime').split(',');
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(415).json({ message: 'Type de fichier non supporté' });
  }
  
  // Vérifier le contenu réel du fichier (au-delà de l'extension)
  const fileType = require('file-type');
  fileType.fromBuffer(req.file.buffer).then(result => {
    if (!result || !allowedMimeTypes.includes(result.mime)) {
      return res.status(415).json({ message: 'Type de fichier non supporté ou invalide' });
    }
    
    // Générer un nom de fichier aléatoire
    const crypto = require('crypto');
    const fileExtension = path.extname(req.file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    req.file.filename = `${randomName}${fileExtension}`;
    
    next();
  }).catch(err => {
    console.error('Erreur lors de la vérification du type de fichier:', err);
    return res.status(500).json({ message: 'Erreur lors de la validation du fichier' });
  });
};
```

## Formation et sensibilisation

### Formation des administrateurs

- **Installation sécurisée** : Procédures de déploiement sécurisé
- **Gestion des mises à jour** : Processus de mise à jour sans interruption
- **Surveillance** : Utilisation des outils de monitoring
- **Gestion des incidents** : Procédures de réponse aux incidents
- **Sauvegarde et restauration** : Méthodes de sauvegarde sécurisée

### Sensibilisation des utilisateurs

- **Bonnes pratiques** : Guide des bonnes pratiques de sécurité
- **Mots de passe** : Recommandations pour des mots de passe forts
- **Partage responsable** : Conseils sur le partage de médias
- **Signalement** : Procédure pour signaler un problème de sécurité
- **Confidentialité** : Sensibilisation à la protection des données personnelles

## Conclusion

La sécurité et la confidentialité sont des aspects fondamentaux du projet RaspberryDay. Ce document établit un cadre complet pour protéger les données des utilisateurs et assurer la sécurité du système, tout en respectant les réglementations en vigueur.

L'approche "sécurité et confidentialité par conception" garantit que ces aspects sont intégrés dès le début du développement et maintenus tout au long du cycle de vie du projet.

La mise en œuvre de ces mesures permettra aux utilisateurs de profiter d'une expérience conviviale tout en ayant l'assurance que leurs données personnelles et leurs médias sont protégés de manière adéquate.