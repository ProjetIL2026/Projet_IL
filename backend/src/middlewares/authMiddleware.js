const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT principal.
 * Vérifie la présence et la validité du token dans l'en-tête HTTP "Authorization: Bearer <token>".
 * Fonctionne aussi bien pour les utilisateurs enregistrés que pour les invités.
 *
 * En cas de succès, attache les données décodées du token dans `req.user` :
 * `req.user = { utilisateur_id, pseudo, est_admin, est_invite, iat, exp }`
 *
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Passage au middleware ou contrôleur suivant
 * @returns {Object} 401 - Token manquant, mal formaté ou expiré
 * @returns {Object} 403 - Token invalide
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if(!authHeader || !authHeader.startsWith('Bearer ')){
    return res.status(401).json({message: "Accès refusé : token manquant ou format invalide."});
  }
  const token = authHeader.split(' ')[1];
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  }
  catch(err){
    if(err.name === 'TokenExpiredError'){
      return res.status(401).json({message: "Session expirée, veuillez vous reconnecter."});
    }
    return res.status(403).json({ message: "Token invalide." });
  }
};

/**
 * Middleware de restriction aux utilisateurs enregistrés uniquement.
 * À placer APRÈS `authMiddleware` sur les routes interdites aux invités
 * (ex: modifier son profil, sauvegarder un salon, supprimer un salon, accéder au dashboard).
 *
 * @param {Object} req - Requête Express (doit contenir `req.user` défini par authMiddleware)
 * @param {Object} res - Réponse Express
 * @param {Function} next - Passage au middleware ou contrôleur suivant
 * @returns {Object} 403 - Si l'utilisateur connecté est un invité (`est_invite === true`)
 */
module.exports.requireRegistered = (req, res, next) => {
  if(req.user && req.user.est_invite){
    return res.status(403).json({message: "Accès refusé : un compte utilisateur enregistré est requis."});
  }
  next();
};