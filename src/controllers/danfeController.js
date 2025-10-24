const { Op } = require('sequelize');
const NotaFiscal = require('../models/NotaFiscal');
// const { search } = require('../routes');

// Função para consulta por ncm com filtro
async function getDanfe(req, res) {
    try {
        const { idVenda } = req.params; 
        const { idEmpresa } = req.params; 
        
        const danfe = await NotaFiscal.findOne({
            where: { 
                idEmpresa: idEmpresa,
                idVenda: idVenda
            }
        });

        if (!danfe) {
            return res.status(404).json({ message: 'Venda não encontrado' });
        }

        res.status(200).json(danfe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar venda', error });
    }
}

module.exports = {
    getDanfe
};