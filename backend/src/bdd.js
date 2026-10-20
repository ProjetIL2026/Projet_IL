const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.BDD_HOTE,
    user: process.env.BDD_UTILISATEUR,
    password: process.env.BDD_MDP,
    database: process.env.BDD_NOM
});

async function test(){
    try{
        const connexion= await pool.getConnection();
        console.log('connexion à la bdd réussie');
        connexion.release();
    } catch(err) {
        console.error('erreur de connexion à la bdd', err.message);
    }
}

test();

module.exports = pool;