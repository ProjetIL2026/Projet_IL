const bdd = require('../bdd');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Nombre de tours de salage pour le hachage bcrypt des mots de passe
const SALT_ROUNDS = 10;

/**
 * Inscription d'un nouvel utilisateur enregistré.
 * Vérifie que l'email et le pseudo sont uniques, hache le mot de passe avec bcrypt,
 * puis insère l'utilisateur en base de données (est_admin = false, est_invite = false).
 *
 * @route POST /api/users/register
 * @access Public
 * @param {Object} req.body - { pseudo: string, email: string, motDePasse: string }
 * @returns {Object} 201 - { message: string, utilisateur_id: number }
 * @returns {Object} 400 - Champs obligatoires manquants
 * @returns {Object} 409 - Email ou pseudo déjà utilisé
 */
exports.register = async (req, res, next) => {
  try{
    const {pseudo, email, motDePasse} = req.body;
    if(!pseudo || !email || !motDePasse){
      return res.status(400).json({message: "Champs obligatoires manquants."});
    }
    const [existing] = await bdd.query('SELECT utilisateur_id FROM utilisateur WHERE email = ? OR pseudo = ?', [email, pseudo]);
    if(existing.length > 0){
      return res.status(409).json({message: "Email ou pseudo déjà utilisé."});
    }
    const motdepasse_hash = await bcrypt.hash(motDePasse, SALT_ROUNDS);
    const [result] = await bdd.query('INSERT INTO utilisateur (pseudo, email, motdepasse_hash, est_admin, est_invite) VALUES (?, ?, ?, false, false)', [pseudo, email, motdepasse_hash]);
    res.status(201).json({message: "Utilisateur créé avec succès !", utilisateur_id: result.insertId});
  }
  catch(error){
    next(error);
  }
};

/**
 * Connexion d'un utilisateur enregistré existant.
 * Vérifie l'email et le mot de passe, puis génère un token JWT valide 24h
 * contenant { utilisateur_id, pseudo, est_admin, est_invite }.
 *
 * @route POST /api/users/login
 * @access Public
 * @param {Object} req.body - { email: string, motDePasse: string }
 * @returns {Object} 200 - { message: string, token: string, user: Object }
 * @returns {Object} 400 - Email ou mot de passe manquant
 * @returns {Object} 401 - Identifiants invalides
 */
exports.login = async (req, res, next) => {
  try{
    const {email, motDePasse} = req.body;
    if (!email || !motDePasse){
      return res.status(400).json({message: "Email et mot de passe requis."});
    }
    const [users] = await bdd.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
    if (users.length === 0){
      return res.status(401).json({message: "Identifiants invalides."});
    }
    const user = users[0];
    const match = await bcrypt.compare(motDePasse, user.motdepasse_hash);
    if (!match){
      return res.status(401).json({message: "Identifiants invalides."});
    }
    const token = jwt.sign(
      {
        utilisateur_id: user.utilisateur_id,
        pseudo: user.pseudo,
        est_admin: Boolean(user.est_admin),
        est_invite: Boolean(user.est_invite)
      }, process.env.JWT_SECRET, {expiresIn: '24h'});
    return res.json({message: "Connexion réussie", token, user: {utilisateur_id: user.utilisateur_id, pseudo: user.pseudo, email: user.email, est_admin: Boolean(user.est_admin), est_invite: Boolean(user.est_invite)}});
  }
  catch(error){
    next(error);
  }
};

/**
 * Récupère les informations du profil de l'utilisateur actuellement connecté.
 * Nécessite le middleware d'authentification (qui injecte req.user depuis le JWT).
 *
 * @route GET /api/users/profile
 * @access Privé (Token Bearer requis)
 * @returns {Object} 200 - { utilisateur_id: number, pseudo: string, email: string|null, est_admin: number }
 * @returns {Object} 404 - Utilisateur introuvable en base
 */
exports.getProfile = async (req, res, next) => {
  try{
    const [users] = await bdd.query('SELECT utilisateur_id, pseudo, email, est_admin FROM utilisateur WHERE utilisateur_id = ?', [req.user.utilisateur_id]);
    if (users.length === 0){
      return res.status(404).json({message: "Utilisateur introuvable."});
    }
    return res.json(users[0]);
  }
  catch(error){
    next(error);
  }
};

/**
 * Met à jour le profil (pseudo et/ou mot de passe) d'un utilisateur enregistré.
 * Interdit aux utilisateurs invités (est_invite === true).
 *
 * @route PUT /api/users/profile
 * @access Privé - Utilisateur enregistré uniquement (authMiddleware + requireRegistered)
 * @param {Object} req.body - { pseudo?: string, motDePasse?: string }
 * @returns {Object} 200 - { message: string }
 * @returns {Object} 400 - Aucune modification fournie
 * @returns {Object} 403 - Utilisateur invité non autorisé
 */
exports.updateProfile = async (req, res, next) => {
  try{
    if(req.user.est_invite){
      return res.status(403).json({message: "L'utilisateur n'est pas enregistré."});
    }
    const {pseudo, motDePasse} = req.body;
    const userId = req.user.utilisateur_id;
    if(!pseudo && !motDePasse){
      return res.status(400).json({message: "Aucune modification fournie."});
    }
    if(pseudo){
      await bdd.query('UPDATE utilisateur SET pseudo = ? WHERE utilisateur_id = ?', [pseudo, userId]);
    }
    if(motDePasse){
      const motdepasse_hash = await bcrypt.hash(motDePasse, SALT_ROUNDS);
      await bdd.query('UPDATE utilisateur SET motdepasse_hash = ? WHERE utilisateur_id = ?', [motdepasse_hash, userId]);
    }
    return res.json({message: "Profil mis à jour avec succès."});
  }
  catch(error){
    next(error);
  }
};

/**
 * Crée une session pour un utilisateur invité (sans email ni mot de passe).
 * Si aucun pseudo n'est fourni, génère automatiquement un pseudo aléatoire ("Invite_xxxxxx").
 * Insère l'invité en BDD (est_invite = true) et retourne un token JWT valide 24h.
 *
 * @route POST /api/users/guest
 * @access Public
 * @param {Object} req.body - { pseudo?: string } (optionnel)
 * @returns {Object} 201 - { message: string, token: string, user: Object }
 * @returns {Object} 409 - Pseudo fourni déjà utilisé
 */
exports.loginGuest = async (req, res, next) => {
  try{
    let {pseudo} = req.body;
    if(!pseudo || pseudo.trim() === ''){
      const randomHex = crypto.randomBytes(3).toString('hex');
      pseudo = `Invite_${randomHex}`;
    }
    else{
      pseudo = pseudo.trim();
      const [existing] = await bdd.query('SELECT utilisateur_id FROM utilisateur WHERE pseudo = ?', [pseudo]);
      if (existing.length > 0){
        return res.status(409).json({message: "Ce pseudo est déjà utilisé."});
      }
    }
    const [result] = await bdd.query('INSERT INTO utilisateur (pseudo, email, motdepasse_hash, est_admin, est_invite) VALUES (?, NULL, NULL, false, true)', [pseudo]);
    const token = jwt.sign(
      {
        utilisateur_id: result.insertId,
        pseudo: pseudo,
        est_admin: false,
        est_invite: true
      }, process.env.JWT_SECRET, {expiresIn: '24h'});
    return res.status(201).json({message: "Session invité créée", token, user:
      {
        utilisateur_id: result.insertId,
        pseudo: pseudo,
        est_admin: false,
        est_invite: true
      }});
  }
  catch(error){
    next(error);
  }
};

/**
 * Permet à un utilisateur invité de définir ou modifier son pseudonyme temporaire.
 * Vérifie que le nouveau pseudo n'est pas déjà pris par un autre utilisateur.
 *
 * @route PUT /api/users/guest/pseudo
 * @access Privé (Token Bearer requis)
 * @param {Object} req.body - { pseudo: string }
 * @returns {Object} 200 - { message: string, pseudo: string }
 * @returns {Object} 400 - Pseudo manquant ou vide
 * @returns {Object} 409 - Pseudo déjà utilisé par un autre compte
 */
exports.definirPseudo = async (req, res, next) => {
  try{
    const {pseudo} = req.body;
    const userId = req.user.utilisateur_id;
    if(!pseudo || pseudo.trim() === ''){
      return res.status(400).json({message: "Un pseudo est requis."});
    }
    const [existing] = await bdd.query('SELECT utilisateur_id FROM utilisateur WHERE pseudo = ? AND utilisateur_id != ?', [pseudo.trim(), userId]);
    if(existing.length > 0){
      return res.status(409).json({message: "Ce pseudo est déjà utilisé."});
    }
    await bdd.query('UPDATE utilisateur SET pseudo = ? WHERE utilisateur_id = ?', [pseudo.trim(), userId]);
    return res.json({message: "Pseudo temporaire mis à jour.", pseudo: pseudo.trim()});
  }
  catch(error){
    next(error);
  }
};