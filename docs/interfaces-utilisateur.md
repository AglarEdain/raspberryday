# Spécifications des Interfaces Utilisateur - Projet RaspberryDay

## Vue d'ensemble

Le projet RaspberryDay comporte trois interfaces utilisateur principales :
1. **Interface TV** : affichée sur le téléviseur via Chromium en mode kiosk
2. **Application Mobile (PWA)** : utilisée par les membres de la famille pour envoyer des médias
3. **Interface d'Administration** : pour la gestion du système

Ce document détaille les spécifications de conception et les fonctionnalités de chaque interface.

## Interface TV

### Principes de conception

- **Simplicité** : Interface minimaliste pour une lisibilité optimale à distance
- **Lisibilité** : Textes grands et contrastés, visibles à plusieurs mètres
- **Focus sur le contenu** : Les médias occupent la majorité de l'écran
- **Navigation intuitive** : Contrôles simples via télécommande TV

### Écrans principaux

#### 1. Écran d'accueil / Diaporama

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                      [IMAGE / VIDÉO ACTUELLE]                   │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ◄ Précédent    ■ Pause    ► Suivant    ≡ Menu    ♥ Favoris     │
├─────────────────────────────────────────────────────────────────┤
│ Envoyé par: Marie    |    12 Juin 2023    |    "Vacances été"   │
└─────────────────────────────────────────────────────────────────┘
```

#### 2. Notification de nouveau média

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                      [IMAGE / VIDÉO ACTUELLE]                   │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ ◄ Précédent    ■ Pause    ► Suivant    ≡ Menu    ♥ Favoris     │
├─────────────────────────────────────────────────────────────────┤
│ Envoyé par: Marie    |    12 Juin 2023    |    "Vacances été"   │
└─────────────────────────────────────────────────────────────────┘
  ┌───────────────────────────────────────────────────────────┐
  │                                                           │
  │  🔔 Nouveau média reçu de Thomas !                        │
  │                                                           │
  │  [Miniature]   "Anniversaire de Mamie"                    │
  │                                                           │
  │  ◄ Plus tard                           Afficher maintenant ►  │
  │                                                           │
  └───────────────────────────────────────────────────────────┘
```

#### 3. Menu principal

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ╔═══════════════════════════════════════════════════════╗     │
│   ║                       MENU                            ║     │
│   ╠═══════════════════════════════════════════════════════╣     │
│   ║ ▶ Reprendre le diaporama                              ║     │
│   ║                                                       ║     │
│   ║ 📁 Parcourir par catégorie                            ║     │
│   ║                                                       ║     │
│   ║ 👤 Parcourir par membre                               ║     │
│   ║                                                       ║     │
│   ║ ♥ Afficher les favoris                                ║     │
│   ║                                                       ║     │
│   ║ ⚙ Paramètres d'affichage                              ║     │
│   ║                                                       ║     │
│   ║ ℹ À propos                                           ║     │
│   ╚═══════════════════════════════════════════════════════╝     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4. Navigation par grille

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   CATÉGORIE: VACANCES D'ÉTÉ 2023                               │
│                                                                 │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│   │         │  │         │  │         │  │         │            │
│   │    1    │  │    2    │  │    3    │  │    4    │            │
│   │         │  │         │  │         │  │         │            │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│                                                                 │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│   │         │  │         │  │         │  │         │            │
│   │    5    │  │    6    │  │    7    │  │    8    │            │
│   │         │  │         │  │         │  │         │            │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│                                                                 │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│   │         │  │         │  │         │  │         │            │
│   │    9    │  │   10    │  │   11    │  │   12    │            │
│   │         │  │         │  │         │  │         │            │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│                                                                 │
│   Page 1/3   ◄ Précédent                       Suivant ►        │
└─────────────────────────────────────────────────────────────────┘
```

### Navigation par télécommande

| Bouton télécommande | Action dans l'interface |
|---------------------|-------------------------|
| Flèches directionnelles | Navigation dans les menus et grilles |
| OK / Entrée | Sélection / Validation |
| Retour | Retour à l'écran précédent |
| Play/Pause | Démarrer/Arrêter le diaporama |
| Suivant | Image/vidéo suivante |
| Précédent | Image/vidéo précédente |
| Menu | Afficher le menu principal |
| 0-9 | Accès rapide aux catégories |

### Transitions et animations

- Transition fondu entre les images (durée: 0.5s)
- Animation subtile lors de l'affichage des notifications
- Mise en évidence visuelle des éléments sélectionnés
- Indicateur de chargement pour les vidéos et contenus lourds

## Application Mobile (PWA)

### Principes de conception

- **Simplicité** : Interface intuitive pour tous les âges
- **Accessibilité** : Boutons larges, textes lisibles, contraste élevé
- **Efficacité** : Envoi de médias en quelques étapes simples
- **Feedback** : Confirmations visuelles des actions

### Écrans principaux

#### 1. Écran d'accueil / Connexion

```
┌─────────────────────────────────────┐
│                                     │
│          [LOGO RASPBERRYDAY]        │
│                                     │
│          Partagez vos photos        │
│          avec votre famille         │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Nom d'utilisateur           │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Mot de passe                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         SE CONNECTER        │    │
│  └─────────────────────────────┘    │
│                                     │
│  Se souvenir de moi                 │
│                                     │
│  Besoin d'aide?                     │
│                                     │
└─────────────────────────────────────┘
```

#### 2. Écran principal

```
┌─────────────────────────────────────┐
│                                     │
│  Bonjour, Marie                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    ENVOYER UNE PHOTO        │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    ENVOYER UNE VIDÉO        │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    MES ENVOIS RÉCENTS       │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │    PARAMÈTRES               │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

#### 3. Envoi de média

```
┌─────────────────────────────────────┐
│ ← Retour                            │
│                                     │
│  ENVOYER UNE PHOTO                  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │                             │    │
│  │      [PRÉVISUALISATION]     │    │
│  │                             │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Ajouter une légende         │    │
│  └─────────────────────────────┘    │
│                                     │
│  Catégorie: ┌─────────────────┐     │
│             │ Choisir...    ▼ │     │
│             └─────────────────┘     │
│                                     │
│  ☐ Afficher immédiatement sur TV    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         ENVOYER             │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

#### 4. Confirmation d'envoi

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│             ✓                       │
│                                     │
│      Photo envoyée avec succès !    │
│                                     │
│      Elle s'affichera bientôt       │
│      sur votre téléviseur.          │
│                                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │    ENVOYER UNE AUTRE        │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │    RETOUR À L'ACCUEIL       │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

#### 5. Historique des envois

```
┌─────────────────────────────────────┐
│ ← Retour                            │
│                                     │
│  MES ENVOIS RÉCENTS                 │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Miniature] Anniversaire    │    │
│  │ 12 juin 2023                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Miniature] Vacances été    │    │
│  │ 10 juin 2023                │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Miniature] Repas famille   │    │
│  │ 5 juin 2023                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Miniature] Jardin fleuri   │    │
│  │ 1 juin 2023                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  Voir plus...                       │
└─────────────────────────────────────┘
```

### Fonctionnalités spécifiques

- **Installation sur écran d'accueil** : Instructions claires pour ajouter la PWA
- **Notifications push** : Confirmation de réception des médias
- **Mode hors-ligne** : Possibilité de préparer des envois sans connexion
- **Compression automatique** : Optimisation des médias avant envoi
- **Partage direct** : Intégration avec l'API de partage du système d'exploitation

## Interface d'Administration

### Principes de conception

- **Fonctionnalité** : Focus sur les outils de gestion et configuration
- **Clarté** : Organisation logique des paramètres et fonctions
- **Contrôle** : Accès à toutes les fonctionnalités avancées du système
- **Sécurité** : Accès restreint et protégé

### Écrans principaux

#### 1. Tableau de bord

```
┌─────────────────────────────────────────────────────────────────┐
│ RaspberryDay - Administration                              ⚙ 👤 │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│  TABLEAU    │  APERÇU DU SYSTÈME                               │
│  DE BORD    │                                                   │
│             │  Espace disque: 45% utilisé [███████░░░░░░░] 450GB│
│  MÉDIAS     │  CPU: 12% [██░░░░░░░░]  Mémoire: 30% [███░░░░░░░] │
│             │  Température: 42°C       Uptime: 15 jours         │
│  UTILISATEURS│                                                   │
│             │  ACTIVITÉ RÉCENTE                                 │
│  CATÉGORIES │                                                   │
│             │  • Marie a envoyé 3 photos (il y a 2h)            │
│  PARAMÈTRES │  • Thomas a envoyé 1 vidéo (il y a 5h)            │
│             │  • Sauvegarde automatique effectuée (il y a 12h)  │
│  SYSTÈME    │  • Mise à jour système disponible                 │
│             │                                                   │
│  LOGS       │  STATISTIQUES                                     │
│             │                                                   │
│  SAUVEGARDE │  Total médias: 1,245    Utilisateurs actifs: 8    │
│             │  Espace libre: 550GB    Catégories: 12            │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

#### 2. Gestion des médias

```
┌─────────────────────────────────────────────────────────────────┐
│ RaspberryDay - Administration > Médias                     ⚙ 👤 │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│  TABLEAU    │  GESTION DES MÉDIAS                    + Ajouter  │
│  DE BORD    │                                                   │
│             │  Filtrer: [Tous les types ▼] [Toutes catégories ▼]│
│  MÉDIAS     │                                                   │
│             │  ┌────────┬──────────┬────────┬────────┬─────────┐│
│  UTILISATEURS│  │ Média  │ Utilisateur│ Date    │ Taille  │ Actions │
│             │  ├────────┼──────────┼────────┼────────┼─────────┤│
│  CATÉGORIES │  │[Thumb] │ Marie     │12/06/23 │ 2.4 MB │ ⋮      │
│             │  │[Thumb] │ Thomas    │12/06/23 │ 15 MB  │ ⋮      │
│  PARAMÈTRES │  │[Thumb] │ Marie     │10/06/23 │ 1.8 MB │ ⋮      │
│             │  │[Thumb] │ Paul      │09/06/23 │ 3.2 MB │ ⋮      │
│  SYSTÈME    │  │[Thumb] │ Sophie    │08/06/23 │ 2.1 MB │ ⋮      │
│             │  │[Thumb] │ Marie     │07/06/23 │ 1.9 MB │ ⋮      │
│  LOGS       │  │[Thumb] │ Thomas    │05/06/23 │ 12 MB  │ ⋮      │
│             │  │[Thumb] │ Paul      │04/06/23 │ 2.5 MB │ ⋮      │
│  SAUVEGARDE │  │[Thumb] │ Sophie    │01/06/23 │ 1.7 MB │ ⋮      │
│             │  └────────┴──────────┴────────┴────────┴─────────┘│
│             │                                                   │
│             │  Page 1 de 139   ◄ Précédent    Suivant ►         │
└─────────────┴───────────────────────────────────────────────────┘
```

#### 3. Paramètres d'affichage

```
┌─────────────────────────────────────────────────────────────────┐
│ RaspberryDay - Administration > Paramètres > Affichage     ⚙ 👤 │
├─────────────┬───────────────────────────────────────────────────┤
│             │                                                   │
│  TABLEAU    │  PARAMÈTRES D'AFFICHAGE                  Enregistrer│
│  DE BORD    │                                                   │
│             │  Diaporama                                        │
│  MÉDIAS     │  ┌─────────────────────────────────────────────┐  │
│             │  │ Durée d'affichage des images:  [15] secondes│  │
│  UTILISATEURS│  │ Durée maximale des vidéos:    [60] secondes│  │
│             │  │ Transition entre médias:       [Fondu    ▼] │  │
│  CATÉGORIES │  │ Afficher les légendes:         [✓]          │  │
│             │  │ Afficher le nom d'utilisateur: [✓]          │  │
│  PARAMÈTRES │  │ Afficher la date:              [✓]          │  │
│    Affichage│  │ Lecture aléatoire:             [ ]          │  │
│    Système  │  └─────────────────────────────────────────────┘  │
│    Réseau   │                                                   │
│    Sécurité │  Économiseur d'écran                             │
│             │  ┌─────────────────────────────────────────────┐  │
│  SYSTÈME    │  │ Activer après inactivité:     [30] minutes  │  │
│             │  │ Type d'économiseur:           [Horloge   ▼] │  │
│  LOGS       │  │ Éteindre l'écran après:       [120] minutes │  │
│             │  └─────────────────────────────────────────────┘  │
│  SAUVEGARDE │                                                   │
│             │  Notifications                                    │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ Afficher les notifications:    [✓]          │  │
│             │  │ Durée d'affichage:             [10] secondes│  │
│             │  │ Son de notification:           [Doux     ▼] │  │
│             │  └─────────────────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────────────────┘
```

### Fonctionnalités spécifiques

- **Gestion des utilisateurs** : Création, modification, suppression
- **Modération des médias** : Possibilité de supprimer ou masquer des contenus
- **Surveillance système** : Monitoring des ressources et services
- **Sauvegarde et restauration** : Outils de backup et récupération
- **Mise à jour système** : Interface de mise à jour du logiciel
- **Logs système** : Consultation des journaux d'activité et d'erreurs

## Thème et identité visuelle

### Palette de couleurs

- **Couleur principale** : #E63946 (Rouge framboise)
- **Couleur secondaire** : #457B9D (Bleu)
- **Couleur d'accentuation** : #F1FAEE (Blanc cassé)
- **Couleur de fond** : #1D3557 (Bleu foncé)
- **Couleur de texte** : #F1FAEE (Blanc cassé)

### Typographie

- **Titres** : Montserrat (sans-serif)
- **Corps de texte** : Open Sans (sans-serif)
- **Taille de base** : 16px (adaptatif selon l'interface)
- **Hiérarchie visuelle** : Utilisation de différentes graisses pour la hiérarchie

### Iconographie

- Style d'icônes simple et reconnaissable
- Ensemble cohérent (Material Design Icons)
- Taille suffisante pour une bonne lisibilité sur TV
- Utilisation de couleurs contrastées

## Responsive Design

- **Interface TV** : Optimisée pour les écrans larges (1080p minimum)
- **PWA Mobile** : Responsive pour smartphones et tablettes
- **Administration** : Compatible desktop et tablettes

## Accessibilité

- Contraste élevé pour une meilleure lisibilité
- Textes alternatifs pour les images
- Navigation possible au clavier
- Compatibilité avec les lecteurs d'écran
- Possibilité d'augmenter la taille des textes