const Sequelize = require('sequelize')

const database = process.env.DATABASE;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
// const host = process.env.HOST; 
// const dialect = process.env.DIALECT;

const connection = new Sequelize(database, username, password, {
    host: "scootica.mysql.dbaas.com.br:3306", 
    dialect: "mysql",
    timezone: 'America/Sao_Paulo'
})

module.exports = connection