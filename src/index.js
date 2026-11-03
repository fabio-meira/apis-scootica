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

// app.use(routes);

// app.listen(port, () => console.log(`
//     Serviço rodando na porta ${port} ou ${protocol}:${ip}:${port}`));

// // Exportar para Vercel
// module.exports = app;

// Abaixo o index.js para publicação no vercel

const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const sequelize = require('./database/connection');
const routes = require('./routes');
const Regiao = require('./models/Regiao');

app.use(express.json());
app.use(cors());

const protocol = process.env.PROTOCOL 
const ip = require('ip').address()
const port = process.env.PORT 

async function ensureFilialRegiaoSchema() {
    const [columns] = await sequelize.query("SHOW COLUMNS FROM filiais LIKE 'idRegiao'");
    if (!columns.length) {
        await sequelize.query('ALTER TABLE filiais ADD COLUMN idRegiao INT NULL');
    }

    const [constraints] = await sequelize.query(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'filiais'
          AND COLUMN_NAME = 'idRegiao'
          AND REFERENCED_TABLE_NAME = 'regioes'
    `);

    if (!constraints.length) {
        await sequelize.query(`
            ALTER TABLE filiais
            ADD CONSTRAINT fk_filiais_regioes
            FOREIGN KEY (idRegiao) REFERENCES regioes(id)
            ON UPDATE CASCADE ON DELETE SET NULL
        `);
    }
}

// Conectar ao banco sem sincronizar estrutura (evita timeout no Vercel)
sequelize.authenticate()
    .then(async () => {
        console.log('Conexão com o banco de dados bem-sucedida');
        await Regiao.sync();
        await ensureFilialRegiaoSchema();
        console.log('Tabela de regiões disponível');
    })
    .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

app.use(routes);

app.listen(port, () => console.log(`
    Serviço rodando na porta ${port} ou ${protocol}:${ip}:${port}`));

module.exports = app;
