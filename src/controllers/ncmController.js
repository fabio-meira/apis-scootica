// const { resolve } = require('path');
// const axios = require("axios");
// const { response } = require('express');
// require('dotenv').config();

// module.exports = {
//     async getNcm(req, res) {
//         const url = `https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json?perfil=PUBLICO`;

//         async function getUrl() {
//             try {
//                 const response = await axios.get(url);
//                 const data = response.data;
//                 const result = data.Nomenclaturas.map(item => ({
//                     Codigo: item.Codigo,
//                     Descricao: item.Descricao
//                 }));
//                 res.json(result);
//             } catch (error) {
//                 res.status(error.response.status).json(error.response.data);
//             }
//         }
        
//         getUrl();
//     }
// };

const Ncm = require('../models/Ncm');
const { Op } = require('sequelize');
// const { search } = require('../routes');

// Função para consulta por ncm com filtro
// async function getNcm(req, res) {
//     try {
//         const { search } = req.query; 
//         const whereClause = {};

//         if (search) {
//             // Se 'search' estiver presente na consulta, adicionar condição para filtrar pelo nome
//             // whereClause.Descricao = { [Op.like]: `%${search}%` }; // Filtrar por nome que contém a substring 'search'
//             whereClause = {
//                 [Op.or]: [
//                     { Descricao: { [Op.like]: `${search}%` } },
//                     { Codigo: { [Op.like]: `${search}%` } }
//                 ]
//             };
//         }

//         const ncm = await Ncm.findAll({
//             where: whereClause,
//             attributes: ['Codigo', 'Descricao']
//         });

//         if (!ncm) {
//             return res.status(404).json({ message: 'Ncm não encontrado' });
//         }

//         res.status(200).json(ncm);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Erro ao buscar Ncm', error });
//     }
// }

async function getNcm(req, res) {
    try {
        const { searchNcm } = req.query;

        let whereClause = {};

        if (searchNcm) {
            whereClause = {
                [Op.or]: [
                    { Descricao: { [Op.like]: `${searchNcm}%` } },
                    { Codigo: { [Op.like]: `${searchNcm}%` } }
                ]
            };
        }

        const ncm = await Ncm.findAll({
            where: whereClause,
            attributes: ['Codigo', 'Descricao']
        });

        if (!ncm || ncm.length === 0) {
            return res.status(404).json({ message: 'Ncm não encontrado' });
        }

        res.status(200).json(ncm);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar Ncm', error });
    }
}

module.exports = {
    getNcm
};