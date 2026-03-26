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

function getEnvNumber(envName, fallbackValue) {
    const parsedValue = Number(process.env[envName]);

    return Number.isFinite(parsedValue) && parsedValue > 0
        ? parsedValue
        : fallbackValue;
}

const poolMax = getEnvNumber('DB_POOL_MAX', 20);
const poolMin = getEnvNumber('DB_POOL_MIN', 2);
const poolAcquire = getEnvNumber('DB_POOL_ACQUIRE', 20000);
const poolIdle = getEnvNumber('DB_POOL_IDLE', 30000);
const poolEvict = getEnvNumber('DB_POOL_EVICT', 10000);
const connectTimeout = getEnvNumber('DB_CONNECT_TIMEOUT', 20000);
const retryMax = getEnvNumber('DB_RETRY_MAX', 2);

const connection = new Sequelize(database, username, password, {
    host,
    dialect: "mysql",
    dialectModule: mysql2,
    timezone: "-03:00",
    logging: false,

    pool: {
        max: poolMax,
        min: poolMin,
        acquire: poolAcquire,
        idle: poolIdle,
        evict: poolEvict
    },

    dialectOptions: {
        connectTimeout,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    },

    retry: {
        max: retryMax,
        match: [
            /Deadlock/i,
            /ETIMEDOUT/i,
            /ECONNRESET/i,
            /SequelizeConnectionAcquireTimeoutError/i,
            /Too many connections/i
        ]
    },

    define: {
        freezeTableName: true,
        timestamps: true
    }
});

connection.getPoolStats = function getPoolStats() {
    const pool = connection.connectionManager?.pool;

    if (!pool) {
        return null;
    }

    return {
        max: pool.maxSize ?? pool.max ?? null,
        min: pool.minSize ?? pool.min ?? null,
        size: pool.size ?? null,
        available: pool.available ?? null,
        using: pool.using ?? null,
        waiting: pool.waiting ?? null
    };
};

module.exports = connection;
