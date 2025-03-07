const express = require ('express')
const app = express()
require('dotenv').config()
const cors = require('cors');
const sequelize = require('./database/connection'); 
// const basicAuth = require('express-basic-auth')

app.use(express.json())

const protocol = process.env.PROTOCOL 
const ip = require('ip').address()
const port = process.env.PORT 

// Permitir requisições de qualquer origem
app.use(cors());

sequelize.sync()
    .then(() => console.log('Banco de dados sincronizado'))
    .catch(err => console.error('Erro ao sincronizar o banco de dados:', err));

const routes = require('./routes')

app.use('/oticas', routes); 

app.use(routes)

app.listen(port, () => console.log(`
    Serviço rodando na porta ${port} ou ${protocol}:${ip}:${port}`));
