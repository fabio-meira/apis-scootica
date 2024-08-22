const ColecaoProduto = require('../models/ColecaoProduto');

// Função para cadastrar um nova coleção de produto
async function postColecaoProduto(req, res) {
    try {
        const ColecaoProdutoData = req.body;
        const { idEmpresa } = req.params; 
        const { nome } = req.body; 

        const colecaoProdutoExists = await ColecaoProduto.findOne({ 
            where: { 
                nome: nome,
                idEmpresa: idEmpresa 
            } 
        });

        if (colecaoProdutoExists) {
            return res.status(400).json({
                error: "Coleção de produto já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa ao objeto colecaoProduto
        ColecaoProdutoData.idEmpresa = idEmpresa;

        const colecaoProduto = await ColecaoProduto.create(ColecaoProdutoData);

        res.status(201).json({ message: 'Coleção de produto cadastrado com sucesso', colecaoProduto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar coleção de produto', error });
    }
}

// função para consulta por todos os coleção de produtos da empresa
async function listColecaoProduto(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const colecaoProduto = await ColecaoProduto.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });
        
        if (!colecaoProduto || colecaoProduto.length === 0) {
            return res.status(404).json({ message: 'Coleção de produto não encontrado' });
        }

        res.status(200).json(colecaoProduto);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar coleção de produto', error });
    }
}

// Função para consulta de coleção de produto por id
async function getColecaoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const colecaoProduto = await ColecaoProduto.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (!colecaoProduto) {
            return res.status(404).json({ message: 'Coleção de produto não encontrado' });
        }

        res.status(200).json(colecaoProduto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar coleção de produto', error });
    }
}

// Função para atualizar um coleção de produto por id
async function putColecaoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const ColecaoProdutoData = req.body; 

        // Atualiza o coleção de produto no banco de dados
        const [updated] = await ColecaoProduto.update(ColecaoProdutoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a coleção de produto atualizado para retornar na resposta
            const colecaoProduto = await ColecaoProduto.findOne({ where: { idEmpresa, id } });
            res.status(200).json({ message: 'Coleção de produto atualizado com sucesso', colecaoProduto });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Coleção de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar coleção de produto', error });
    }
}

// Função para deletar uma coleção de produto pelo id
async function deleteColecaoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deletar a coleção de produto no banco de dados
        const deleted = await ColecaoProduto.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Coleção de produto deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Coleção de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar coleção de produto', error });
    }
}

module.exports = {
    postColecaoProduto,
    listColecaoProduto,
    getColecaoProduto,
    putColecaoProduto,
    deleteColecaoProduto
};
