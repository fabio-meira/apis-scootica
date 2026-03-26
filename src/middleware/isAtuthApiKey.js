const Authentication = require('../models/Authentication');
const sequelize = require('../database/connection');
const SimpleTtlCache = require('../utils/simpleTtlCache');

const apiKeyCache = new SimpleTtlCache(
    Number(process.env.API_KEY_CACHE_TTL_MS) || 300000,
    1000
);

function isTransientDatabaseError(error) {
    const errorMessage = `${error?.name || ''} ${error?.message || ''}`;

    return /SequelizeConnectionAcquireTimeoutError|SequelizeConnectionError|ETIMEDOUT|ECONNRESET|Too many connections/i.test(errorMessage);
}

module.exports = {

    async IsAuthApiKey (req, res, next){

        const authHeader = req.headers.authorization;

        if(!authHeader)
            return res.status(400).send({
                error: "Authorization",
                message: "No token provided"
        })

        if (!authHeader.startsWith('Basic ')) {
            return res.status(400).send({
                error: "Authorization",
                message: "Invalid authorization type"
            });
        }

        // Decodificar as credenciais do cabeçalho de autorização
        const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        if (!username || !password) {
            return res.status(400).send({
                error: "Authorization",
                message: "Invalid credentials format"
            });
        }

        try{
            const cachedAuth = apiKeyCache.get(authHeader);
            let authentication = cachedAuth;

            if (!authentication) {
                authentication = await Authentication.findOne({
                    where: { 
                        username: username,
                        password: password
                    },
                    attributes: ['id', 'idEmpresa', 'username'],
                    raw: true
                });

                if (authentication) {
                    apiKeyCache.set(authHeader, authentication);
                }
            }

            // Verifica se a autenticação foi encontrada
            if (!authentication)
                throw new Error("Unauthorized");

            next();

        }catch(error){
            if (isTransientDatabaseError(error)) {
                console.error('Erro de pool ao validar apiKey:', {
                    username,
                    error: error.message,
                    pool: sequelize.getPoolStats?.()
                });

                return res.status(503).send({
                    error: "Database unavailable",
                    message: "Banco temporariamente ocupado. Tente novamente em instantes."
                });
            }

            // Retorne a mensagem de erro de autenticação
            return res.status(401).send({
                error: "Unauthorized",
                message: error.message 
            })
        }
        
    }
}
