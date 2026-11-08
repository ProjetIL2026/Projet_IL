const express = require("express");
require('dotenv').config();
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const bdd = require('./bdd');
const io = new Server(server);


app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

// npm run dev