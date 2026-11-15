const jwt = require('jsonwebtoken');
const bdd = require('./bdd');
const Salon = require('./models/Salon');

const salons = {};

const getSalon = async (code) => {
    if (salons[code]) return salons[code];
    const [rows] = await bdd.query('SELECT code_unique, nom, capacite_max, date_creation, est_sauvegarde, hote_id FROM salon WHERE code_unique = ?', [code]);
    if (rows.length === 0) return null;
    if (!salons[code]) {
        salons[code] = new Salon({
            codeUnique: rows[0].code_unique,
            nom: rows[0].nom,
            capaciteMax: rows[0].capacite_max,
            dateCreation: rows[0].date_creation,
            estSauvegarde: rows[0].est_sauvegarde,
            hoteId: rows[0].hote_id
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
                await quitter(socket);
                const salon = await getSalon(code);
                if (!salon) return socket.emit("erreur", "Salon introuvable.");
                if (!salon.ajouterParticipant(socket.id)) return socket.emit("erreur", "Salon complet.");
                socket.join(code);
                socket.data.code = code;
                io.to(code).emit("participants", salon.participants.size);
                socket.emit("etat", salon.instantane());
            } catch(err){
                console.error(err);
                socket.emit("erreur", "Erreur serveur.");
            }
        });

        socket.on("quitterSalon", async () => {
            const code = socket.data.code;
            await quitter(socket);
            if (code && salons[code]) io.to(code).emit("participants", salons[code].participants.size);
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

        socket.on("demandeEtat", () => {
            const salon = salonDe();
            if (!salon) return;
            socket.emit("etat", salon.instantane());
        });

        socket.on("disconnect", async () => {
            const code = socket.data.code;
            await quitter(socket);
            if (code && salons[code]) io.to(code).emit("participants", salons[code].participants.size);
        });
    });
};