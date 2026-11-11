const express = require("express");
const http = require("http");
require('dotenv').config();
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const bdd = require('./bdd');
const io = new Server(server);
const userRoutes = require('./routes/utilisateurRoutes')

app.use(express.json());
app.use('/api/users', userRoutes);

//test route
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

const PORT = 8888;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// npm run dev