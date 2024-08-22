const express = require('express')
const { sign } = require('jsonwebtoken')
require('dotenv').config()
const connection = require('../database/connection')

module.exports = {

    async auth (req, res) {
        const { clientId, username, password} = req.body;
        const expiresIn = process.env.EXPIRES_IN;
        const timeElapsed = Date();
        const today = new Date(timeElapsed);
    
        const [, data] = await connection.query(`
                SELECT * FROM autentications 
                WHERE clientId = '${clientId}' AND username = '${username}' AND password = '${password}'
            `)
        
            if (data == ''){
                return res.status(404).send({
                    error:"user or password not found"})
            }
        
            const token = sign({
                clientId, username, password
            }, process.env.TOKEN_SECRET, {
                expiresIn: process.env.EXPIRES_IN,
            });

            return res.json({
                tokenType: "Bearer",
                token, 
                apiKey,
                createdAt: (today),
                expiresIn: (expiresIn) + " milliseconds"
            })
    }

} 

