/**
 * Routes liées à la gestion des utilisateurs (Enregistrés et Invités).
 * Préfixe monté dans app.js : /api/users
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/utilisateurController');
const authMiddleware = require('../middlewares/authMiddleware');

// --- Routes publiques (sans authentification) ---

// POST /api/users/register : Créer un compte utilisateur enregistré
router.post('/register', userController.register);

// POST /api/users/login : Se connecter avec email et mot de passe (retourne un JWT)
router.post('/login', userController.login);

// POST /api/users/guest : Démarrer une session invité avec pseudo choisi ou aléatoire (retourne un JWT)
router.post('/guest', userController.loginGuest);

// --- Routes protégées (nécessitent l'en-tête "Authorization: Bearer <token>") ---

// GET /api/users/profile : Récupérer les infos de l'utilisateur connecté
router.get('/profile', authMiddleware, userController.getProfile);

// PUT /api/users/profile : Modifier son pseudo ou mot de passe (réservé aux comptes enregistrés)
router.put('/profile', authMiddleware, authMiddleware.requireRegistered, userController.updateProfile);

// PUT /api/users/guest/pseudo : Modifier son pseudo temporaire en tant qu'invité
router.put('/guest/pseudo', authMiddleware, userController.definirPseudo);

module.exports = router;