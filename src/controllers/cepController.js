const { resolve } = require('path');
const axios = require ("axios");
const { response } = require('express');
require('dotenv').config();

module.exports = {

    async getCep(req,res){
        const cep = req.params.cep;

        const url = `https://viacep.com.br/ws/${cep}/json/`

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