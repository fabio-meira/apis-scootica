const ColecaoProduto = require('../models/ColecaoProduto');
const GrupoProduto = require('../models/GrupoProduto');
const MarcaProduto = require('../models/MarcaProduto');
const Produto = require('../models/Produto');
const SubGrupoProduto = require('../models/SubGrupoProduto');
const Fornecedor = require('../models/Fornecedores');
const { Op } = require('sequelize')

// Função para cadastrar um novo produto
async function postProduto(req, res) {
    try {
        const produtoData = req.body;
        const { idEmpresa } = req.params; 
        const { referencia, codigoBarras } = req.body;

        const produtoExists = await Produto.findOne({ 
            where: { 
                referencia: referencia,
                codigoBarras: codigoBarras,
                idEmpresa: idEmpresa 
            } 
        });

        if (produtoExists) {
            return res.status(400).json({
                error: "Produto já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa ao objeto produtoData
        produtoData.idEmpresa = idEmpresa;

        const produto = await Produto.create(produtoData);

        res.status(201).json({ message: 'Produto cadastrado com sucesso', produto });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar produto', error });
    }
}

// função para consulta por todos os produtos da empresa
async function listProdutos(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { startDate, endDate, idMarca, idFornecedor } = req.query; 

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por data de início e data de fim, se fornecidos
        if (startDate) {
            whereConditions.createdAt = {
                [Op.gte]: new Date(startDate) 
            };
        }

        if (endDate) {
            if (!whereConditions.createdAt) {
                whereConditions.createdAt = {};
            }
            whereConditions.createdAt[Op.lte] = new Date(endDate); 
        }

        // Adicione filtro por status, se fornecido
        if (idMarca) {
            whereConditions.idMarca = idMarca; 
        }

        // Adicione filtro por idFornecedor, se fornecido
        if (idFornecedor) {
            whereConditions.idFornecedor = idFornecedor;
        }

        const produtos = await Produto.findAll({
            where: whereConditions, 
            include: [
                { 
                    model: Fornecedor, 
                    as: 'fornecedores',
                    attributes: ['id','razaoSocial', 'nomeFantasia', 'cnpj', 'celular'] 
                },
                {
                    model: GrupoProduto, 
                    as: 'grupoProdutos',
                    attributes: ['nome', 'situacao']  
                },
                {
                    model: SubGrupoProduto, 
                    as: 'subGrupoProdutos',
                    attributes: ['nome', 'situacao']
                },
                {
                    model: MarcaProduto, 
                    as: 'marcaProdutos',
                    attributes: ['id','nome', 'situacao'] 
                },
                {
                    model: ColecaoProduto,
                    as: 'colecaoProdutos',
                    attributes: ['nome', 'situacao']
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produtos', error });
    }
}

// Função para consulta de produto por referencia
async function getProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const produto = await Produto.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            },
            include: [
                { 
                    model: Fornecedor, 
                    as: 'fornecedores',
                    attributes: ['razaoSocial', 'nomeFantasia', 'cnpj', 'celular'] 
                },
                {
                    model: GrupoProduto, 
                    as: 'grupoProdutos',
                    attributes: ['nome', 'situacao'] 
                },
                {
                    model: SubGrupoProduto, 
                    as: 'subGrupoProdutos',
                    attributes: ['nome', 'situacao'] 
                },
                {
                    model: MarcaProduto, 
                    as: 'marcaProdutos',
                    attributes: ['nome', 'situacao'] 
                },
                {
                    model: ColecaoProduto,
                    as: 'colecaoProdutos',
                    attributes: ['nome', 'situacao']
                }
            ]
        });

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto', error });
    }
}

// Função para consulta de produto por codigoBarras
async function getProdutoEan(req, res) {
    try {
        const { codigoBarras } = req.params; 
        const { idEmpresa } = req.params; 
        const produto = await Produto.findOne({
            where: { 
                idEmpresa: idEmpresa,
                codigoBarras: codigoBarras
            },
            include: [
                { 
                    model: Fornecedor, 
                    as: 'fornecedores' 
                },
                {
                    model: GrupoProduto, 
                    as: 'grupoProdutos' 
                },
                {
                    model: SubGrupoProduto, 
                    as: 'subGrupoProdutos' 
                },
                {
                    model: MarcaProduto, 
                    as: 'marcaProdutos' 
                },
                {
                    model: ColecaoProduto,
                    as: 'colecaoProdutos'
                }
            ]
        });

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.status(200).json(produto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto', error });
    }
}

// Função para atualizar um produto por referencia
async function putProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const produtoData = req.body; 

        // Atualiza o produto no banco de dados
        const [updated] = await Produto.update(produtoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (updated) {
            // Busca o produto atualizado para retornar na resposta
            const produto = await Produto.findOne({ where: { idEmpresa, id } });
            res.status(200).json({ message: 'Produto atualizado com sucesso', produto });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto', error });
    }
}

// Função para atualizar o estoque de um produto pela referência
async function patchProduto(req, res) {
    try {
        const { referencia } = req.params; 
        const { idEmpresa } = req.params; 
        const produtoData = req.body; 

        // Atualiza o produto no banco de dados
        const [updated] = await Produto.update(produtoData, {
            where: { 
                idEmpresa: idEmpresa,
                referencia: referencia
            }
        });

        if (updated) {
            // Busca o produto atualizado para retornar na resposta
            const produto = await Produto.findOne({ where: { idEmpresa, referencia } });
            res.status(200).json({ message: 'Produto atualizado com sucesso', produto });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto', error });
    }
}

// Função para deletar um produto pelo referencia
async function deleteProduto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o produto no banco de dados
        const deleted = await Produto.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Produto deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar produto', error });
    }
}

module.exports = {
    postProduto,
    listProdutos,
    getProduto,
    getProdutoEan,
    putProduto,
    patchProduto,
    deleteProduto
};