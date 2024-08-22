const GrupoProduto = require('../models/GrupoProduto');
const SubGrupoProduto = require('../models/SubGrupoProduto');

// Função para cadastrar um novo sub grupo de produto
async function postSubGrupoProduto(req, res) {
    try {
        const SubGrupoProdutoData = req.body;
        const { idEmpresa } = req.params; 
        const { nome } = req.body;

        const subGrupoProdutoExists = await SubGrupoProduto.findOne({ 
            where: { 
                nome: nome,
                idEmpresa: idEmpresa 
            } 
        });

        if (subGrupoProdutoExists) {
            return res.status(400).json({
                error: "Sub grupo de produto já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa ao objeto subGrupoProduto
        SubGrupoProdutoData.idEmpresa = idEmpresa;

        const subGrupoProduto = await SubGrupoProduto.create(SubGrupoProdutoData);

        res.status(201).json({ message: 'Sub grupo de produto cadastrado com sucesso', subGrupoProduto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar sub grupo de produto', error });
    }
}

// função para consulta por todos os sub grupos de produtos da empresa
async function listSubGrupoProduto(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const subGrupoProduto = await SubGrupoProduto.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            include: [
                {
                    model: GrupoProduto, 
                    as: 'grupoProduto' 
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(subGrupoProduto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar sub grupo de produto', error });
    }
}

// Função para consulta de sub grupo de produto por id
async function getSubGrupoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const subGrupoProduto = await SubGrupoProduto.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            },
            include: [
                {
                    model: GrupoProduto, 
                    as: 'grupoProduto' 
                }
            ]
        });

        if (!subGrupoProduto) {
            return res.status(404).json({ message: 'Sub grupo de produto não encontrado' });
        }

        res.status(200).json(subGrupoProduto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar sub grupo de produto', error });
    }
}

// Função para atualizar um sub grupo de produto por id
async function putSubGrupoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const SubGrupoProdutoData = req.body; 

        // Atualiza o grupo de produto no banco de dados
        const [updated] = await SubGrupoProduto.update(SubGrupoProdutoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o grupo de produto atualizado para retornar na resposta
            const subGrupoProduto = await SubGrupoProduto.findOne({ where: { idEmpresa, id } });
            res.status(200).json({ message: 'Sub grupo de produto atualizado com sucesso', subGrupoProduto });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Sub grupo de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar sub grupo de produto', error });
    }
}

// Função para deletar um sub grupo de produto pelo id
async function deleteSubGrupoProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o grupo de produto no banco de dados
        const deleted = await SubGrupoProduto.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Sub grupo de produto deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Sub grupo de produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar sub grupo de produto', error });
    }
}

module.exports = {
    postSubGrupoProduto,
    listSubGrupoProduto,
    getSubGrupoProduto,
    putSubGrupoProduto,
    deleteSubGrupoProduto
};
