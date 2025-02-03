const Origem = require('../models/Origem');


// Função para cadastrar um nova origem
async function postOrigem(req, res) {
    try {
        const origemData = req.body;
        const { idEmpresa } = req.params; 
        const { descricao } = req.body; 

        // Verificar se origem já está cadastrado
        const origemExists = await Origem.findOne({ 
            where: { 
                descricao: descricao,
                idEmpresa: idEmpresa 
            } 
        });

        if (origemExists) {
            return res.status(400).json({
                error: "Origem já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto origemData
        origemData.idEmpresa = idEmpresa;

        const origem = await Origem.create(origemData);

        res.status(201).json({ message: 'Origem cadastrado com sucesso', origem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar origem', error });
    }
}

// função para consulta por todos as origens da empresa
async function listOrigem(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const origem = await Origem.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(origem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar origem', error });
    }
}

// Função para consulta de origem por id
async function getOrigem(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const origem = await Origem.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!origem) {
            return res.status(404).json({ message: 'Origem não encontrado' });
        }

        res.status(200).json(origem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar origem', error });
    }
}

// Função para atualizar um origem
async function putOrigem(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const origemData = req.body; 

        // Atualiza o origem no banco de dados
        const [updated] = await Origem.update(origemData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a origem atualizado para retornar na resposta
            const origem = await Origem.findByPk(id);
            res.status(200).json({ message: 'Origem atualizado com sucesso', origem });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Origem não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar origem', error });
    }
}

// Função para deletar uma origem por id
async function deleteOrigem(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a origem no banco de dados
        const deleted = await Origem.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Origen deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Origem não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar origem', error });
    }
}

module.exports = {
    postOrigem,
    listOrigem,
    getOrigem,
    putOrigem,
    deleteOrigem
};