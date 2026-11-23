const jwt = require('jsonwebtoken');
const bdd = require('./bdd');
const Salon = require('./models/Salon');
const messageController = require('./controllers/messageController');

const salons = {};
// gardé pour pouvoir prévenir les salons depuis les routes REST (renommer, supprimer...)
let ioServeur = null;

// délai minimum entre deux messages d'un même utilisateur (anti-spam)
const DELAI_ENTRE_MESSAGES = 300;

// liste des membres d'un salon avec leur pseudo (pour l'affichage côté client)
const membresDu = (code) => {
    const salon = salons[code];
    if (!salon || !ioServeur) return [];
    const membres = [];
    for (const socketId of salon.participants) {
        const s = ioServeur.sockets.sockets.get(socketId);
        if (!s) continue;
        membres.push({
            socketId: socketId,
            utilisateurId: s.data.user.utilisateur_id,
            pseudo: s.data.user.pseudo,
            estHote: s.data.user.utilisateur_id === salon.hoteId
        });
    }
    return membres;
};

const envoyerMembres = (code) => {
    if (!code || !salons[code]) return;
    ioServeur.to(code).emit("membres", membresDu(code));
};

// envoie les anciens messages à quelqu'un qui vient d'arriver dans le salon
const envoyerHistorique = async (socket, salon) => {
    // si le salon est sauvegardé et qu'on vient de le charger, on récupère les messages en BDD
    if (salon.estSauvegarde && salon.messages.length === 0) {
        try{
            const anciens = await messageController.chargerHistorique(salon.codeUnique);
            // on garde aussi les messages arrivés pendant le chargement
            if (salon.messages.length === 0) salon.messages = anciens;
        } catch(err){
            console.error("erreur de chargement de l'historique", err.message);
        }
    }
    socket.emit("historique", salon.messages);
};

const getSalon = async (code) => {
    if (salons[code]) return salons[code];
    const [rows] = await bdd.query('SELECT code_unique, nom, capacite_max, date_creation, est_sauvegarde, host_id FROM salon WHERE code_unique = ?', [code]);
    if (rows.length === 0) return null;
    if (!salons[code]) {
        salons[code] = new Salon({
            codeUnique: rows[0].code_unique,
            nom: rows[0].nom,
            capaciteMax: rows[0].capacite_max,
            dateCreation: rows[0].date_creation,
            estSauvegarde: rows[0].est_sauvegarde,
            hoteId: rows[0].host_id
        });
    }
    return salons[code];
};

const quitter = async (socket) => {
    const code = socket.data.code;
    if (!code) return;
    socket.leave(code);
    socket.data.code = null;
    const salon = salons[code];
    if (!salon) return;
    salon.retirerParticipant(socket.id);
    if (!salon.estVide()) return;
    delete salons[code];
    if (!salon.estSauvegarde) {
        try{
            await bdd.query('DELETE FROM salon WHERE code_unique = ?', [code]);
        } catch(err){
            console.error('erreur de suppression du salon', err.message);
        }
    }
};

module.exports = (io) => {
    ioServeur = io;

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Token manquant."));
        try{
            socket.data.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch(err){
            next(new Error("Token invalide ou expiré."));
        }
    });

    io.on("connection", (socket) => {

        const salonDe = () => socket.data.code ? salons[socket.data.code] : null;

        socket.on("ping-temps", (heureClient, repondre) => {
            if (typeof repondre !== "function") return;
            repondre({ heureClient: heureClient, heureServeur: Date.now() });
        });

        socket.on("rejoindreSalon", async (code) => {
            if (typeof code !== "string" || code.length < 1 || code.length > 20) return;
            try{
                const ancienCode = socket.data.code;
                await quitter(socket);
                // si on venait d'un autre salon, on met à jour la liste des membres là-bas
                if (ancienCode && ancienCode !== code) envoyerMembres(ancienCode);
                const salon = await getSalon(code);
                if (!salon) return socket.emit("erreur", "Salon introuvable.");
                if (salon.estBanni(socket.data.user.utilisateur_id)) return socket.emit("erreur", "Vous avez été expulsé de ce salon.");
                if (!salon.ajouterParticipant(socket.id)) return socket.emit("erreur", "Salon complet.");
                socket.join(code);
                socket.data.code = code;
                io.to(code).emit("participants", salon.participants.size);
                socket.emit("etat", salon.instantane());
                envoyerMembres(code);
                await envoyerHistorique(socket, salon);
            } catch(err){
                console.error(err);
                socket.emit("erreur", "Erreur serveur.");
            }
        });

        socket.on("quitterSalon", async () => {
            const code = socket.data.code;
            await quitter(socket);
            if (code && salons[code]) io.to(code).emit("participants", salons[code].participants.size);
            envoyerMembres(code);
        });

        socket.on("chargerVideo", (url) => {
            const salon = salonDe();
            if (!salon || !salon.chargerVideo(url)) return;
            io.to(socket.data.code).emit("etat", salon.instantane());
        });

        socket.on("controlerLecteur", (action, timecode) => {
            const salon = salonDe();
            if (!salon || !salon.controlerLecteur(action, timecode)) return;
            io.to(socket.data.code).emit("etat", salon.instantane());
        });

        socket.on("changerVitesse", (vitesse, timecode) => {
            const salon = salonDe();
            if (!salon || !salon.changerVitesse(vitesse, timecode)) return;
            io.to(socket.data.code).emit("etat", salon.instantane());
        });

        // --- Chat ---
        socket.on("envoyerMessage", async (texte) => {
            const salon = salonDe();
            if (!salon) return;
            // anti-spam : on ignore les messages trop rapprochés
            const maintenant = Date.now();
            if (socket.data.dernierMessage && maintenant - socket.data.dernierMessage < DELAI_ENTRE_MESSAGES) return;
            socket.data.dernierMessage = maintenant;

            const user = socket.data.user;
            const message = salon.envoyerMessage(texte, user.pseudo, user.utilisateur_id);
            if (!message) return socket.emit("erreur", "Message vide ou trop long (500 caractères max).");

            // on l'envoie tout de suite à tout le monde (y compris l'auteur)
            io.to(socket.data.code).emit("nouveauMessage", message);

            // puis on l'enregistre en BDD seulement si le salon est sauvegardé
            if (salon.estSauvegarde) {
                try{
                    await messageController.enregistrerMessage(salon.codeUnique, user.utilisateur_id, message.contenu);
                } catch(err){
                    console.error("erreur d'enregistrement du message", err.message);
                }
            }
        });

        // --- Expulsion d'un participant par l'hôte ---
        socket.on("expulser", async (socketIdCible) => {
            const salon = salonDe();
            if (!salon) return;
            if (socket.data.user.utilisateur_id !== salon.hoteId) return socket.emit("erreur", "Seul l'hôte peut expulser.");
            if (socketIdCible === socket.id || !salon.participants.has(socketIdCible)) return;
            const cible = io.sockets.sockets.get(socketIdCible);
            if (!cible) return;
            const code = socket.data.code;
            salon.bannir(cible.data.user.utilisateur_id);
            cible.emit("expulse", "Vous avez été expulsé du salon par l'hôte.");
            await quitter(cible);
            io.to(code).emit("participants", salon.participants.size);
            envoyerMembres(code);
        });

        socket.on("demandeEtat", () => {
            const salon = salonDe();
            if (!salon) return;
            socket.emit("etat", salon.instantane());
        });

        socket.on("disconnect", async () => {
            const code = socket.data.code;
            await quitter(socket);
            if (code && salons[code]) io.to(code).emit("participants", salons[code].participants.size);
            envoyerMembres(code);
        });
    });
};

// --- Fonctions appelées depuis salonController (routes REST) ---

module.exports.renommerSalon = (code, nom) => {
    if (salons[code]) salons[code].nom = nom;
    if (ioServeur) ioServeur.to(code).emit("salonRenomme", nom);
};

module.exports.sauvegarderSalon = (code) => {
    if (salons[code]) salons[code].estSauvegarde = true;
};

// prévient les participants que le salon est supprimé et les fait sortir
module.exports.fermerSalon = (code) => {
    if (!ioServeur) return;
    ioServeur.to(code).emit("salonSupprime", "Le salon a été supprimé par l'hôte.");
    const salon = salons[code];
    if (salon) {
        for (const socketId of salon.participants) {
            const s = ioServeur.sockets.sockets.get(socketId);
            if (!s) continue;
            s.leave(code);
            s.data.code = null;
        }
        delete salons[code];
    }
};
