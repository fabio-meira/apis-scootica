// const { Sequelize } = require('sequelize');
// const mysql2 = require('mysql2');

// const database = process.env.DATABASE;
// const username = process.env.USERNAME;
// const password = process.env.PASSWORD;
// const host = process.env.HOST;

// const connection = new Sequelize(database, username, password, {
//     host,
//     dialect: "mysql",
//     dialectModule: mysql2,
//     timezone: "-03:00", // Ajustado para UTC-3 (São Paulo)
//     // timezone: 'America/Sao_Paulo',
//     logging: false,  // Desativa logs no Vercel para melhor performance

//     pool: { // Otimização para ambiente Serverless
//         max: 5,
//         min: 0,
//         idle: 10000,
//         acquire: 30000
//     },
//     retry: {
//         max: 3 // Tenta reconectar até 3 vezes em caso de falha
//     },
//     define: {
//         freezeTableName: true, // Evita Sequelize modificar nomes das tabelas
//         timestamps: true // Se o banco não usa createdAt/updatedAt, desative
//     },
//     // dialectOptions: {
//     //     allowPublicKeyRetrieval: true, // Necessário para MySQL 8+ remoto
//     //     ssl: false                     // Desativa SSL se não estiver configurado
//     // }
// });

// // Teste a conexão ao iniciar o app
// connection.authenticate()
//     .then(() => console.log("✅ Conexão com o banco de dados bem-sucedida!"))
//     .catch(err => console.error("❌ Erro ao conectar no banco de dados:", err));
    
// module.exports = connection;

const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const database = process.env.DATABASE;
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
const host = process.env.HOST || "127.0.0.1"; // Melhor prática

const connection = new Sequelize(database, username, password, {
    host,
    dialect: "mysql",
    dialectModule: mysql2,
    timezone: "-03:00",
    logging: false,

    pool: {
        max: 10,
        min: 0,
        acquire: 60000,     // Espera até 60s para pegar uma conexão
        idle: 10000,        // Conexões ociosas vivem só 10s
        evict: 10000,       // Remove conexões "adormecidas"
        handleDisconnects: true
    },

    dialectOptions: {
        connectTimeout: 60000 // Evita timeout no handshake
    },

    retry: {
        max: 3
    },

    define: {
        freezeTableName: true,
        timestamps: true
    }
});

// Teste de conexão
connection.authenticate()
    .then(() => console.log("✅ Conexão com o banco de dados bem-sucedida!"))
    .catch(err => console.error("❌ Erro ao conectar no banco de dados:", err));

module.exports = connection;
