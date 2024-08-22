const { Sequelize, EmptyResultError } = require('sequelize');
const Authentication = require('../models/Authentication');

module.exports = {

    async IsAuthApiKey (req, res, next){

        const authHeader = req.headers.authorization;

        if(!authHeader)
            return res.status(400).send({
                error: "Authorization",
                message: "No token provided"
        })

        // Decodificar as credenciais do cabeçalho de autorização
        const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        try{
            // Consulta no banco de dados usando Sequelize
            const authentication = await Authentication.findOne({
                where: { 
                    username: username,
                    password: password
                }
            });

            // Verifica se a autenticação foi encontrada
            if (!authentication)
                throw new Error("Unauthorized");

            next();

        }catch(error){
            // Retorne a mensagem de erro de autenticação
            return res.status(401).send({
                error: "Unauthorized",
                message: error.message 
            })
        }
        
    }
}
