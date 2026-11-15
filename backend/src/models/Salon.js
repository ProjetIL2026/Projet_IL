const extraireId = (url) => {
    if (typeof url !== "string") return null;
    const resultat = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    return resultat ? resultat[1] : null;
};

const estNombre = (x) => typeof x === "number" && Number.isFinite(x) && x >= 0;

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

    positionActuelle() {
        if (!this.estEnLecture) return this.timecodeCourant;
        return this.timecodeCourant + (Date.now() - this.misAJourLe) / 1000;
    }

    instantane() {
        return {
            urlVideo: this.urlVideoCourante,
            videoId: extraireId(this.urlVideoCourante),
            enLecture: this.estEnLecture,
            position: this.positionActuelle(),
            heureServeur: Date.now(),
            nbParticipants: this.participants.size
        };
    }
}

module.exports = Salon;