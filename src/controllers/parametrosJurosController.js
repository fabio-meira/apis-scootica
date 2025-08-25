const ParametroJuros = require('../models/parametrosJuros');

async function postJuros(req, res) {
    const jurosData = req.body;
    const { idEmpresa } = req.params; 
    const { jurosMensal } = req.body; 

    try {
        // Verificar se o valor de juros está presente
        if (jurosMensal === undefined || jurosMensal <= 0) {
        return res.status(400).json({ erro: 'O valor de juros mensal deve ser positivo e maior que zero' });
        }

        // Desativar o atual parâmetro de juros, se houver algum ativo
        await ParametroJuros.update({ ativo: false }, {
        where: { ativo: true }
        });

        // Adiciona o idEmpresa que vem na rota
        jurosData.idEmpresa = idEmpresa;

        // Criar um novo parâmetro de juros
        const novoParametroJuros = await ParametroJuros.create(jurosData);

        return res.status(201).json({
        mensagem: 'Novo parâmetro de juros inserido com sucesso!',
        parametro_juros: novoParametroJuros
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro ao inserir parâmetro de juros' });
    }
}

async function listJuros(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const parametroJuros = await ParametroJuros.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(parametroJuros);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar parametros de juros', error });
    }
}
module.exports = { 
    postJuros,
    listJuros 
};
