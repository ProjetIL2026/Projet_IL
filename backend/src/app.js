require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const bdd = require('./bdd');
const io = new Server(server);
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const salonRoutes = require('./routes/salonRoutes');
const initSocket = require('./socket');

app.use(express.json());
app.use(express.static("public"));

app.get('/api/bdd/status', async (req, res) => {
    try{
        const [rows] = await bdd.query("SELECT 1+1 AS result");
        res.json({status: 'ok', db:'connecté', result: rows[0].result});
    } catch(err){
        res.status(500).json({ 
            status: "error", 
            message: err.message || err.code || String(err) 
        });
    }
})

app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/salons', salonRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({message: "Erreur serveur."});
});

initSocket(io);

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});