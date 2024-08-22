const Fornecedor = require('../models/Fornecedores');

// Função para cadastrar um novo laboratório
async function postFornecedor(req, res) {
    try {
        const fornecedorData = req.body;
        const { idEmpresa } = req.params; 
        const { cnpj } = req.body; 

        // Verificar se fornecedor já está cadastrado
        const fornecedorExists = await Fornecedor.findOne({ 
            where: { 
                cnpj: cnpj,
                idEmpresa: idEmpresa 
            } 
        });

        if (fornecedorExists) {
            return res.status(400).json({
                error: "Fornecedor já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto fornecedorData
        fornecedorData.idEmpresa = idEmpresa;
        fornecedorData.idFornecedor = cnpj;

        const fornecedor = await Fornecedor.create(fornecedorData);

        res.status(201).json({ message: 'Fornecedor cadastrado com sucesso', fornecedor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar fornecedor', error });
    }
}

// função para consulta por todos os laboratórios da empresa
async function listFornecedor(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const fornecedor = await Fornecedor.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(fornecedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar fornecedor', error });
    }
}

// Função para consulta de fornecedor por id
async function getFornecedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const fornecedor = await Fornecedor.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!fornecedor) {
            return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }

        res.status(200).json(fornecedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar fornecedor', error });
    }
}

// Função para consulta de fornecedor por cpf
async function getCnpjFornecedor(req, res) {
    try {
        const { cnpj } = req.params; 
        const { idEmpresa } = req.params; 

        const forncedor = await Fornecedor.findOne({
            where: { 
                idEmpresa: idEmpresa,
                cnpj: cnpj
            }
        });

        if (!forncedor) {
            return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }

        res.status(200).json(forncedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar fornecedor', error });
    }
}

// Função para atualizar um fornecedor
async function putFornecedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const fornecedorData = req.body; 

        // Atualiza o fornecedor no banco de dados
        const [updated] = await Fornecedor.update(fornecedorData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o fornecedor atualizado para retornar na resposta
            const forncedor = await Fornecedor.findByPk(id);
            res.status(200).json({ message: 'Fornecedor atualizado com sucesso', forncedor });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Fornecedor não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar fornecedor', error });
    }
}

// Função para deletar um fornecedor por id
async function deleteFornecedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o fornecedor no banco de dados
        const deleted = await Fornecedor.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Fornecedor deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Forncedor não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar fornecedor', error });
    }
}

module.exports = {
    postFornecedor,
    listFornecedor,
    getFornecedor,
    getCnpjFornecedor,
    putFornecedor,
    deleteFornecedor
};