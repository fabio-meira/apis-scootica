// const Sequelize = require('sequelize');
// const mysql2 = require('mysql2');

// const database = process.env.DATABASE;
// const username = process.env.USERNAME;
// const password = process.env.PASSWORD;
// const host = process.env.HOST; 
// // const dialect = process.env.DIALECT;

// const connection = new Sequelize(database, username, password, {
//     host, 
//     dialect: "mysql",
//     dialectModule: require('mysql2'),
//     timezone: 'America/Sao_Paulo'
// })

// module.exports = connection

// Abaixo configuração para a publicação no vercel

// const { Sequelize } = require('sequelize');
// const mysql2 = require('mysql2');

// const database = process.env.DATABASE;
// const username = process.env.USERNAME;
// const password = process.env.PASSWORD;
// const host = process.env.HOST;

// const connection = new Sequelize(database, username, password, {
//     host,
//     dialect: "mysql",
//     dialectModule: require('mysql2'),
//     timezone: "-03:00", // Usando UTC-3 para São Paulo
//     logging: false,  // Desativa logs do Sequelize para melhorar performance no Vercel
//     pool: {           // Otimiza conexões para ambiente Serverless
//         max: 5,
//         min: 0,
//         idle: 10000,
//         acquire: 30000
//     }
// });

// module.exports = connection;


const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const database = process.env.DATABASE;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const host = process.env.HOST;

const connection = new Sequelize(database, username, password, {
    host,
    dialect: "mysql",
    dialectModule: mysql2,
    timezone: "-03:00", // Ajustado para UTC-3 (São Paulo)
    // timezone: 'America/Sao_Paulo',
    logging: true,  // Desativa logs no Vercel para melhor performance

    pool: { // Otimização para ambiente Serverless
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 30000
    },
    retry: {
        max: 3 // Tenta reconectar até 3 vezes em caso de falha
    },
    define: {
        freezeTableName: true, // Evita Sequelize modificar nomes das tabelas
        timestamps: true // Se o banco não usa createdAt/updatedAt, desative
    }
});

// Teste a conexão ao iniciar o app
connection.authenticate()
    .then(() => console.log("✅ Conexão com o banco de dados bem-sucedida!"))
    .catch(err => console.error("❌ Erro ao conectar no banco de dados:", err));

module.exports = connection;
