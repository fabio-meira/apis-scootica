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

const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const database = process.env.DATABASE;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const host = process.env.HOST;

const connection = new Sequelize(database, username, password, {
    host,
    dialect: "mysql",
    dialectModule: require('mysql2'),
    timezone: "-03:00", // Usando UTC-3 para São Paulo
    logging: false,  // Desativa logs do Sequelize para melhorar performance no Vercel
    pool: {           // Otimiza conexões para ambiente Serverless
        max: 5,
        min: 0,
        idle: 10000,
        acquire: 30000
    }
});

module.exports = connection;