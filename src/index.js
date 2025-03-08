const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const sequelize = require('./database/connection');
const routes = require('./routes');

app.use(express.json());
app.use(cors());

// Sincronizando banco de dados
sequelize.sync()
    .then(() => console.log('Banco de dados sincronizado'))
    .catch(err => console.error('Erro ao sincronizar o banco de dados:', err));

// Usando as rotas
app.use('/api', routes);

// Exportar para Vercel
module.exports = app;
