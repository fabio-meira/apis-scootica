const Banco = require('../models/Banco');


// Função para cadastrar novo banco
async function postBanco(req, res) {
    try {
        const bancoData = req.body;
        const { idEmpresa } = req.params; 
        const { digitoConta } = req.body; 
        const { contaCorrente } = req.body; 
        const { codigoBanco } = req.body; 

        // Verificar se banco já está cadastrado
        const bancoExists = await Banco.findOne({ 
            where: { 
                digitoConta: digitoConta,
                contaCorrente: contaCorrente,
                codigoBanco: codigoBanco,
                idEmpresa: idEmpresa 
            } 
        });

        if (bancoExists) {
            return res.status(400).json({
                error: "Banco já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto bancoData
        bancoData.idEmpresa = idEmpresa;

        const banco = await Banco.create(bancoData);

        res.status(201).json({ message: 'Banco cadastrado com sucesso', banco });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar banco', error });
    }
}

// função para consulta por todas os bancos da empresa
async function listBanco(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const banco = await Banco.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(banco);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar banco', error });
    }
}

// Função para consulta por id do banco
async function getBanco(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const banco = await Banco.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!banco) {
            return res.status(404).json({ message: 'Banco não encontrado' });
        }

        res.status(200).json(banco);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar banco', error });
    }
}

// Função para atualizar o banco
async function putBanco(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const bancoData = req.body; 

        // Atualiza o banco no banco de dados
        const [updated] = await Banco.update(bancoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o banco atualizado para retornar na resposta
            const banco = await Banco.findByPk(id);
            res.status(200).json({ message: 'Banco atualizado com sucesso', banco });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Banco não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar banco', error });
    }
}

// Função para deletar um banco por id
async function deleteBanco(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o banco no banco de dados
        const deleted = await Banco.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Banco deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Banco não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar banco', error });
    }
}

module.exports = {
    postBanco,
    listBanco,
    getBanco,
    putBanco,
    deleteBanco
};