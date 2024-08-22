const { resolve } = require('path');
const axios = require ("axios");
const { response } = require('express');
require('dotenv').config();

module.exports = {

    async getBanco(req,res){

        const url = `https://brasilapi.com.br/api/banks/v1`

        function getUrl(){
            axios.get(url)
            .then(response => {
                const data = response.data
                return res.json(data)
            })
            .catch(error => {
                res.status(error.response.status).send(res.json(error.response.data))        
            }) 
        }
        getUrl()
    },
    async getIdBanco(req,res){
        const id = req.params.id;

        const url = `https://brasilapi.com.br/api/banks/v1/${id}`

        function getUrl(){
            axios.get(url)
            .then(response => {
                const data = response.data
                return res.json(data)
            })
            .catch(error => {
                res.status(error.response.status).send(res.json(error.response.data))        
            }) 
        }
        getUrl()
    }
}