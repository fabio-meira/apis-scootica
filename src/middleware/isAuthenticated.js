const express = require('express');
const { verify } = require('jsonwebtoken');

module.exports = {
    
    async IsAuthenticated (req, res, next){

        const authHeader = req.headers.authorization;

        if(!authHeader)
            return res.status(400).send({
                error: "Authorization Bearer",
                message: "No token provided"
        })

        try{
            const token = req.headers.authorization.replace('Bearer ', '');
            const validToken = verify(token, process.env.TOKEN_SECRET);
            req['tokenData'] = validToken;
            next();

        }catch(error){
            return res.status(401).send({
                error: "Unauthorized",
                message: (error)            
            })
        }
        
    }
}