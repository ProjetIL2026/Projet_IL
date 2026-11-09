const bdd = require('../bdd');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

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
    const token = jwt.sign({utilisateur_id: user.utilisateur_id, pseudo: user.pseudo, est_admin: Boolean(user.est_admin)}, process.env.JWT_SECRET, {expiresIn: '24h'});
    return res.json({message: "Connexion réussie", token, user: {utilisateur_id: user.utilisateur_id, pseudo: user.pseudo, email: user.email, est_admin: Boolean(user.est_admin)}});
  }
  catch(error){
    next(error);
  }
};

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

exports.updateProfile = async (req, res, next) => {
  try{
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