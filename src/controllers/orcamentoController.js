const Orcamento = require('../models/Orcamento');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Receituario = require('../models/Receita');
const Medico = require('../models/Medico');
const OrcamentoProduto = require('../models/OrcamentoProduto');
const Laboratorio = require('../models/Laboratorio');
const Empresa = require('../models/Empresa');
const OrdemServico = require('../models/OrdemServico');
const { Op } = require('sequelize')

// Função para criar um novo orçamentos e seus relacionamentos
async function postOrcamento(req, res) {
    try {
        const orcamentoData = req.body;
        const { idEmpresa } = req.params; 

        orcamentoData.idEmpresa = idEmpresa;

        const orcamento = await Orcamento.create(orcamentoData);

        // Criar registros nas tabelas relacionadas
        const produtos = orcamentoData.produtos.map(produto => ({
            ...produto,
            idOrcamento: orcamento.id
        }));
        await OrcamentoProduto.bulkCreate(produtos);

        const totais = {
            ...orcamentoData.totais,
            idOrcamento: orcamento.id
        };
        await OrdemProdutoTotal.create(totais);

        res.status(201).json({ message: 'Orçamento criado com sucesso', orcamento });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar orçamento', error });
    }
}

// Função para consultar todos os orçamentos e seus relacionamentos
async function getOrcamentos(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { startDate, endDate, status, idVendedor, orcamento } = req.query; 

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
        if (status) {
            whereConditions.situacao = status; 
        }

        // Adicione filtro por idVendedor, se fornecido
        if (idVendedor) {
            whereConditions.idVendedor = idVendedor;
        }

        // Adicione filtro por idOrcamento, se fornecido
        if (orcamento) {
            whereConditions.id = orcamento;
        }

        const orcamentos = await Orcamento.findAll({
            where: whereConditions,
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
                {
                    model: Cliente, 
                    as: 'cliente' 
                },
                {
                    model: Vendedor, 
                    as: 'vendedor' 
                },
                {
                    model: Receituario, 
                    as: 'receita',
                    include: [
                        {
                            model: Medico,
                            as: 'medico'
                        }
                    ]
                },
                {
                    model: Laboratorio, 
                    as: 'laboratorio' 
                },
                {
                    model: OrcamentoProduto,
                    as: 'produtos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(orcamentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar orçamentos', error });
    }
}

// Função para consultar todos os orçamentos e seus relacionamentos que não sejam uma Ordem de serviço
async function getOrcamentosSO(req, res) {
    try {
        const { idEmpresa } = req.params;

        // Subconsulta para encontrar IDs que devem ser excluídos
        const excludedIdsRecords = await OrdemServico.findAll({
            attributes: ['idOrcamento'],
            where: {
                idOrcamento: {
                    [Op.ne]: null // Garante que estamos considerando apenas valores não nulos
                }
            },
            raw: true // Garante que retornamos dados puros, não instâncias do Sequelize
        });

        // Extrair os IDs dos registros retornados
        const excludedIds = excludedIdsRecords.map(record => record.idOrcamento);

        // Consulta principal com exclusão
        const orcamentos = await Orcamento.findAll({
            where: { 
                idEmpresa: idEmpresa,
                id: {
                    [Op.notIn]: excludedIds // Excluir orçamentos que têm ID em excludedIds
                }
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
                {
                    model: Cliente, 
                    as: 'cliente' 
                },
                {
                    model: Vendedor, 
                    as: 'vendedor' 
                },
                {
                    model: Receituario, 
                    as: 'receita',
                    include: [
                        {
                            model: Medico,
                            as: 'medico'
                        }
                    ]
                },
                {
                    model: Laboratorio, 
                    as: 'laboratorio' 
                },
                {
                    model: OrcamentoProduto,
                    as: 'produtos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(orcamentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar orçamentos', error });
    }
}

// Função para buscar por id do orçamento
async function getIdOrcamento(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const orcamento = await Orcamento.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'telefone', 'celular']
                },
                {
                    model: Cliente, 
                    as: 'cliente' 
                },
                {
                    model: Vendedor, 
                    as: 'vendedor' 
                },
                {
                    model: Receituario, 
                    as: 'receita',
                    include: [
                        {
                            model: Medico,
                            as: 'medico'
                        }
                    ]
                },
                {
                    model: Laboratorio, 
                    as: 'laboratorio' 
                },
                {
                    model: OrcamentoProduto,
                    as: 'produtos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                }
            ]
        });

        if (!orcamento) {
            return res.status(404).json({ message: 'Orçamento não encontrado' });
        }

        res.status(200).json(orcamento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar orçamento', error });
    }
}


// Função para buscar por idVendedor do orçamento
async function getIdVendedorOrcamento(req, res) {
    try {
        const { idVendedor } = req.params; 
        const { idEmpresa } = req.params; 
        const orcamento = await Orcamento.findAll({
            where: {
                idEmpresa: idEmpresa,
                idVendedor: idVendedor
            },
            include: [
                { 
                    model: OrcamentoProduto, 
                    as: 'produtos' 
                },
                { 
                    model: OrdemProdutoTotal, 
                    as: 'totais' 
                }
            ]
        });

        if (!orcamento) {
            return res.status(404).json({ message: 'Orçamento não encontrado' });
        }

        res.status(200).json(orcamento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar orçamento', error });
    }
}

// Função para atualizar um orçamento
async function putOrcamento(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const orcamentoData = req.body; 

        // Atualiza um orçamento no banco de dados
        const [updated] = await Orcamento.update(orcamentoData, {
            where: { 
                id: id,
                idEmpresa: idEmpresa
            }
        });

        if (updated) {
            // Busca um orçamento atualizada para retornar na resposta
            const orcamento = await Orcamento.findOne({ where: { id: id, idEmpresa: idEmpresa } });
            res.status(200).json({ message: 'Orçamento atualizada com sucesso', orcamento });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Orçamento não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar orçamento', error });
    }
}

// Função para deletar um orçamento pelo id
async function deleteOrcamento(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o orçamento no banco de dados
        const deleted = await Orcamento.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Orçamento deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Orçamento não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar orçamento', error });
    }
}

module.exports = {
    postOrcamento,
    getOrcamentos,
    getOrcamentosSO,
    getIdOrcamento,
    putOrcamento,
    getIdVendedorOrcamento,
    deleteOrcamento 
};