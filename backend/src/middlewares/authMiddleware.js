const jwt = require('jsonwebtoken');

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