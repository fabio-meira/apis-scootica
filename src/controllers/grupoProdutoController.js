const GrupoProduto = require('../models/GrupoProduto');

// Função para cadastrar um novo grupo de produto
async function postGrupoProduto(req, res) {
    try {
        const GrupoProdutoData = req.body;
        const { idEmpresa } = req.params; 
        const { nome } = req.body;

        const grupoProdutoExists = await GrupoProduto.findOne({ 
            where: { 
                nome: nome,
                idEmpresa: idEmpresa 
            } 
        });

        if (grupoProdutoExists) {
            return res.status(400).json({
                error: "Grupo de produto já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa ao objeto grupoProduto
        GrupoProdutoData.idEmpresa = idEmpresa;

        const grupoProduto = await GrupoProduto.create(GrupoProdutoData);

        res.status(201).json({ message: 'Grupo de produto cadastrado com sucesso', grupoProduto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar grupo de produto', error });
    }
}

// função para consulta por todos os grupos de produtos da empresa
async function listGrupoProduto(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const grupoProduto = await GrupoProduto.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(grupoProduto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar grupo de produto', error });
    }
}

// Função para consulta de grupo de produto por id
async function getGrupoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const grupoProduto = await GrupoProduto.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (!grupoProduto) {
            return res.status(404).json({ message: 'Grupo de produto não encontrado' });
        }

        res.status(200).json(grupoProduto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar grupo de produto', error });
    }
}

// Função para atualizar um grupo de produto por id
async function putGrupoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const GrupoProdutoData = req.body; 

        // Atualiza o grupo de produto no banco de dados
        const [updated] = await GrupoProduto.update(GrupoProdutoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o grupo de produto atualizado para retornar na resposta
            const grupoProduto = await GrupoProduto.findOne({ where: { idEmpresa, id } });
            res.status(200).json({ message: 'Grupo de produto atualizado com sucesso', grupoProduto });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Grupo de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar grupo de produto', error });
    }
}

// Função para deletar um grupo de produto pelo id
async function deleteGrupoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o grupo de produto no banco de dados
        const deleted = await GrupoProduto.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Grupo de produto deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Grupo de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar grupo de produto', error });
    }
}

module.exports = {
    postGrupoProduto,
    listGrupoProduto,
    getGrupoProduto,
    putGrupoProduto,
    deleteGrupoProduto
};
