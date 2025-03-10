// const express = require('express');
// const app = express();
// require('dotenv').config();
// const cors = require('cors');
// const sequelize = require('./database/connection');
// const routes = require('./routes');

// app.use(express.json());

// const protocol = process.env.PROTOCOL 
// const ip = require('ip').address()
// const port = process.env.PORT 

// app.use(cors());

// // Sincronizando banco de dados
// sequelize.sync()
//     .then(() => console.log('Banco de dados sincronizado'))
//     .catch(err => console.error('Erro ao sincronizar o banco de dados:', err));

// // Usando as rotas
// app.use('/oticas', routes);

// // app.use(routes);

// // app.listen(port, () => console.log(`
// //     Serviço rodando na porta ${port} ou ${protocol}:${ip}:${port}`));

// // Exportar para Vercel
// module.exports = app;

// Abaixo o index.js para publicação no vercel

const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const sequelize = require('./database/connection');
const routes = require('./routes');

app.use(express.json());
app.use(cors());


const protocol = process.env.PROTOCOL 
const ip = require('ip').address()
const port = process.env.PORT 


// Conectar ao banco sem sincronizar estrutura (evita timeout no Vercel)
sequelize.authenticate()
    .then(() => console.log('Conexão com o banco de dados bem-sucedida'))
    .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

// Usando as rotas
app.use('/oticas', routes);

app.use(routes);

app.listen(port, () => console.log(`
    Serviço rodando na porta ${port} ou ${protocol}:${ip}:${port}`));

// Exportar para Vercel
module.exports = app;
