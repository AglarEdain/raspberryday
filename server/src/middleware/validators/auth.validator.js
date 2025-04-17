/**
 * Validateurs pour les routes d'authentification
 */

/**
 * Validation des données de connexion
 */
exports.validateLogin = (req, res, next) => {
    const { username, password } = req.body;

    const errors = [];

    if (!username) {
        errors.push('Le nom d\'utilisateur est requis');
    }

    if (!password) {
        errors.push('Le mot de passe est requis');
    }

    if (username && (username.length < 3 || username.length > 50)) {
        errors.push('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
    }

    if (password && password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: {
                message: 'Données de connexion invalides',
                details: errors
            }
        });
    }

    next();
};

/**
 * Validation des données d'inscription
 */
exports.validateRegister = (req, res, next) => {
    const { username, password, email, display_name } = req.body;

    const errors = [];

    // Validation du nom d'utilisateur
    if (!username) {
        errors.push('Le nom d\'utilisateur est requis');
    } else if (username.length < 3 || username.length > 50) {
        errors.push('Le nom d\'utilisateur doit contenir entre 3 et 50 caractères');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.push('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores');
    }

    // Validation du mot de passe
    if (!password) {
        errors.push('Le mot de passe est requis');
    } else if (password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/.test(password)) {
        errors.push('Le mot de passe doit contenir au moins une lettre et un chiffre');
    }

    // Validation de l'email
    if (!email) {
        errors.push('L\'adresse email est requise');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('L\'adresse email n\'est pas valide');
    }

    // Validation du nom d'affichage
    if (!display_name) {
        errors.push('Le nom d\'affichage est requis');
    } else if (display_name.length < 2 || display_name.length > 100) {
        errors.push('Le nom d\'affichage doit contenir entre 2 et 100 caractères');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: {
                message: 'Données d\'inscription invalides',
                details: errors
            }
        });
    }

    next();
};