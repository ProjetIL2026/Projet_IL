const bdd = require('../bdd');
const crypto = require('crypto');

exports.creer = async (req, res, next) => {
  try{
    const {nom, estSauvegarde} = req.body;
    if(!nom){
      return res.status(400).json({message: "Nom du salon requis."});
    }
    const code = crypto.randomBytes(4).toString('hex');
    const [result] = await bdd.query('INSERT INTO salon (code_unique, nom, est_sauvegarde, hote_id) VALUES (?, ?, ?, ?)', [code, nom, Boolean(estSauvegarde), req.user.utilisateur_id]);
    res.status(201).json({message: "Salon créé avec succès !", salon_id: result.insertId, code});
  }
  catch(error){
    next(error);
  }
};

exports.getSalon = async (req, res, next) => {
  try{
    const [salons] = await bdd.query('SELECT salon_id, code_unique, nom, capacite_max, est_sauvegarde, hote_id FROM salon WHERE code_unique = ?', [req.params.code]);
    if (salons.length === 0){
      return res.status(404).json({message: "Salon introuvable."});
    }
    return res.json(salons[0]);
  }
  catch(error){
    next(error);
  }
};

exports.mesSalons = async (req, res, next) => {
  try{
    const [salons] = await bdd.query('SELECT salon_id, code_unique, nom, est_sauvegarde FROM salon WHERE hote_id = ?', [req.user.utilisateur_id]);
    return res.json(salons);
  }
  catch(error){
    next(error);
  }
};