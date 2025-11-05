// const { resolve } = require('path');
// const axios = require ("axios");
// const { response } = require('express');
// require('dotenv').config();

// module.exports = {

//     async getCep(req,res){
//         const cep = req.params.cep;

//         const url = `https://viacep.com.br/ws/${cep}/json/`

//         function getUrl(){
//             axios.get(url)
//             .then(response => {
//                 const data = response.data
//                 return res.json(data) 
//             })
//             .catch(error => {
//                 res.status(error.response.status).send(res.json(error.response.data))        
//             }) 
//         }
//         getUrl()
//     }
// }

const axios = require("axios");
require("dotenv").config();

module.exports = {
  async getCep(req, res) {
    const cep = req.params.cep;
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
      const response = await axios.get(url);

      // Se a API retornar erro no formato JSON (ex: { erro: true })
      if (response.data.erro) {
        return res.status(404).json({
          erro: true,
          mensagem: "CEP não encontrado"
        });
      }

      return res.json(response.data);

    } catch (error) {
      // Se não houver resposta da API (erro de rede ou outro)
      if (!error.response) {
        return res.status(500).json({
          erro: true,
          mensagem: "Erro ao conectar à API ViaCEP"
        });
      }

      // Se houver resposta mas com erro (ex: 400, 404)
      return res.status(error.response.status || 500).json({
        erro: true,
        mensagem: "Erro ao buscar o CEP",
        detalhes: error.response.data
      });
    }
  }
};