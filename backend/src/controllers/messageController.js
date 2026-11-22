const bdd = require('../bdd');

// nombre de messages renvoyés dans l'historique
const LIMITE_HISTORIQUE = 50;

// enregistre un message en BDD (utilisé par socket.js pour les salons sauvegardés)
exports.enregistrerMessage = async (code, utilisateurId, contenu) => {
  await bdd.query(
    'INSERT INTO message (contenu, date_envoi, salon_id, utilisateur_id) SELECT ?, NOW(), salon_id, ? FROM salon WHERE code_unique = ?',
    [contenu, utilisateurId, code]
  );
};

// récupère les derniers messages d'un salon, du plus ancien au plus récent
exports.chargerHistorique = async (code) => {
  const [rows] = await bdd.query(
    `SELECT m.contenu, m.date_envoi, u.pseudo, u.utilisateur_id
     FROM message m
     JOIN salon s ON s.salon_id = m.salon_id
     JOIN utilisateur u ON u.utilisateur_id = m.utilisateur_id
     WHERE s.code_unique = ?
     ORDER BY m.date_envoi DESC, m.message_id DESC
     LIMIT ?`,
    [code, LIMITE_HISTORIQUE]
  );
  // on remet dans l'ordre chronologique et au même format que les messages en mémoire
  return rows.reverse().map((row) => ({
    contenu: row.contenu,
    auteurPseudo: row.pseudo,
    auteurId: row.utilisateur_id,
    dateEnvoi: row.date_envoi
  }));
};

// supprime tous les messages d'un salon (avant de supprimer le salon)
exports.supprimerMessages = async (salonId) => {
  await bdd.query('DELETE FROM message WHERE salon_id = ?', [salonId]);
};

// GET /api/salons/:code/messages : historique du chat d'un salon
exports.historique = async (req, res, next) => {
  try{
    const [salons] = await bdd.query('SELECT salon_id FROM salon WHERE code_unique = ?', [req.params.code]);
    if (salons.length === 0){
      return res.status(404).json({message: "Salon introuvable."});
    }
    const messages = await exports.chargerHistorique(req.params.code);
    return res.json(messages);
  }
  catch(error){
    next(error);
  }
};
