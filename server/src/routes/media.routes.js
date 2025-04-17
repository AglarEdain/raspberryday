const express = require('express');
const router = express.Router();
const multer = require('multer');
const mediaController = require('../controllers/media.controller');
const auth = require('../middleware/auth');
const { validateMediaUpload, validateMediaUpdate } = require('../middleware/validators/media.validator');
const config = require('../config/config');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(config.media.uploadDir, 'temp'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuration des filtres pour les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
    if (config.media.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.media.maxFileSize
    }
});

/**
 * @route GET /api/media
 * @desc Récupérer la liste des médias avec pagination et filtres
 * @access Private
 */
router.get('/', auth, mediaController.getMediaList);

/**
 * @route POST /api/media/upload
 * @desc Télécharger un nouveau média
 * @access Private
 */
router.post('/upload', 
    auth, 
    upload.single('file'),
    validateMediaUpload,
    mediaController.uploadMedia
);

/**
 * @route GET /api/media/:id
 * @desc Récupérer un média spécifique
 * @access Private
 */
router.get('/:id', auth, mediaController.getMediaById);

/**
 * @route PUT /api/media/:id
 * @desc Mettre à jour les informations d'un média
 * @access Private
 */
router.put('/:id',
    auth,
    validateMediaUpdate,
    mediaController.updateMedia
);

/**
 * @route DELETE /api/media/:id
 * @desc Supprimer un média
 * @access Private
 */
router.delete('/:id', auth, mediaController.deleteMedia);

/**
 * @route POST /api/media/:id/favorite
 * @desc Marquer/Démarquer un média comme favori
 * @access Private
 */
router.post('/:id/favorite', auth, mediaController.toggleFavorite);

/**
 * @route GET /api/media/category/:categoryId
 * @desc Récupérer les médias d'une catégorie spécifique
 * @access Private
 */
router.get('/category/:categoryId', auth, mediaController.getMediaByCategory);

/**
 * @route GET /api/media/user/:userId
 * @desc Récupérer les médias d'un utilisateur spécifique
 * @access Private
 */
router.get('/user/:userId', auth, mediaController.getMediaByUser);

/**
 * @route GET /api/media/:id/download
 * @desc Télécharger un média
 * @access Private
 */
router.get('/:id/download', auth, mediaController.downloadMedia);

module.exports = router;