const extraireId = (url) => {
    if (typeof url !== "string") return null;
    const resultat = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return resultat ? resultat[1] : null;
};

const estNombre = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0;

// vitesses autorisées (les mêmes que celles proposées par YouTube)
const VITESSES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const TAILLE_MAX_MESSAGE = 500;
const NB_MESSAGES_MAX = 50;

class Salon {
    constructor({ codeUnique, nom, capaciteMax, dateCreation, estSauvegarde, hoteId }) {
        this.codeUnique = codeUnique;
        this.nom = nom;
        this.capaciteMax = capaciteMax || 4;
        this.dateCreation = dateCreation;
        this.estSauvegarde = Boolean(estSauvegarde);
        this.hoteId = hoteId;

        this.participants = new Set();
        this.urlVideoCourante = null;
        this.timecodeCourant = 0;
        this.estEnLecture = false;
        this.misAJourLe = Date.now();

        // vitesse de lecture partagée (1 = normal)
        this.vitesse = 1;
        // derniers messages du chat gardés en mémoire
        this.messages = [];
        // utilisateurs expulsés par l'hôte (ne peuvent plus revenir)
        this.bannis = new Set();
    }

    bannir(utilisateurId) {
        this.bannis.add(utilisateurId);
    }

    estBanni(utilisateurId) {
        return this.bannis.has(utilisateurId);
    }

    ajouterParticipant(socketId) {
        if (this.participants.has(socketId)) return true;
        if (this.participants.size >= this.capaciteMax) return false;
        this.participants.add(socketId);
        return true;
    }

    retirerParticipant(socketId) {
        this.participants.delete(socketId);
    }

    estVide() {
        return this.participants.size === 0;
    }

    chargerVideo(url) {
        const id = extraireId(url);
        if (!id) return false;
        this.urlVideoCourante = `https://www.youtube.com/watch?v=${id}`;
        this.timecodeCourant = 0;
        this.estEnLecture = true;
        this.misAJourLe = Date.now();
        return true;
    }

    controlerLecteur(action, timecode) {
        if (!this.urlVideoCourante || !estNombre(timecode)) return false;
        if (action === "play") this.estEnLecture = true;
        else if (action === "pause") this.estEnLecture = false;
        else if (action !== "seek") return false;
        this.timecodeCourant = timecode;
        this.misAJourLe = Date.now();
        return true;
    }

    changerVitesse(vitesse, timecode) {
        if (!this.urlVideoCourante || !estNombre(timecode)) return false;
        if (!VITESSES.includes(vitesse)) return false;
        this.vitesse = vitesse;
        this.timecodeCourant = timecode;
        this.misAJourLe = Date.now();
        return true;
    }

    // ajoute un message au chat du salon, renvoie le message ou null si invalide
    envoyerMessage(texte, auteurPseudo, auteurId) {
        if (typeof texte !== "string") return null;
        const contenu = texte.trim();
        if (contenu.length === 0 || contenu.length > TAILLE_MAX_MESSAGE) return null;
        const message = {
            contenu: contenu,
            auteurPseudo: auteurPseudo,
            auteurId: auteurId,
            dateEnvoi: new Date()
        };
        this.messages.push(message);
        // on garde seulement les derniers messages en mémoire
        if (this.messages.length > NB_MESSAGES_MAX) this.messages.shift();
        return message;
    }

    positionActuelle() {
        if (!this.estEnLecture) return this.timecodeCourant;
        return this.timecodeCourant + ((Date.now() - this.misAJourLe) / 1000) * this.vitesse;
    }

    instantane() {
        return {
            urlVideo: this.urlVideoCourante,
            videoId: extraireId(this.urlVideoCourante),
            enLecture: this.estEnLecture,
            vitesse: this.vitesse,
            position: this.positionActuelle(),
            heureServeur: Date.now(),
            nbParticipants: this.participants.size
        };
    }
}

module.exports = Salon;