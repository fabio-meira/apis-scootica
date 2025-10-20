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
const sequelize = require('../database/connection');
const { criarOrcamentoNoKommo } = require("../services/kommoService");

// Função para criar um novo orçamentos e seus relacionamentos
async function postOrcamento(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const orcamentoData = req.body;
        const { idEmpresa } = req.params; 

        orcamentoData.idEmpresa = idEmpresa;

        // Obter o próximo número de orçamento por idEmpresa
        const maxNumero = await Orcamento.max('numeroOR', {
            where: { idEmpresa },
            transaction
          });
        orcamentoData.numeroOR = (maxNumero || 0) + 1;

        const orcamento = await Orcamento.create(orcamentoData, { transaction });

        // Criar registros nas tabelas relacionadas
        const produtos = orcamentoData.produtos.map(produto => ({
            ...produto,
            idOrcamento: orcamento.id
        }));
        await OrcamentoProduto.bulkCreate(produtos, { transaction });

        const totais = {
            ...orcamentoData.totais,
            idOrcamento: orcamento.id
        };
        await OrdemProdutoTotal.create(totais, { transaction });

        // Buscar empresa antes de validar integracaoCRM
        const empresa = await Empresa.findOne({
            where: { idEmpresa: idEmpresa },
            transaction
        });

        // Buscar cliente antes de validar integracaoCRM
        const cliente = await Cliente.findOne({
            where: { idEmpresa: idEmpresa,
                id: orcamentoData.idCliente
              },
              transaction
        });

        // Buscar vendedor antes de validar integracaoCRM
        const vendedor = await Vendedor.findOne({
            where: { idEmpresa: idEmpresa,
                id: orcamentoData.idVendedor
              },
              transaction
        });

        // Cria orçamento no Kommo somente se integração CRM estiver habilitada
        try {
            if (empresa.integracaoCRM === true) {

                const idFilial = orcamentoData.idFilial; 
                
                const orcamentoKommo = await criarOrcamentoNoKommo(
                    idEmpresa,
                    idFilial,                     
                    orcamentoData,                
                    cliente,   
                    vendedor,                   
                    produtos,
                    totais          
                );

                 // Extrai o id retornado pelo Kommo
                const idCRM = orcamentoKommo?.[0]?.id;
                console.log('idCRM', idCRM);

                if (idCRM) {
                    // Atualiza cliente com idCRM e marca exportado = true
                    await orcamento.update(
                        { idLead: idCRM, integradoCRM: true },
                        { 
                            where: { 
                                id: orcamento.id,        
                                idEmpresa: idEmpresa 
                            },
                            transaction 
                        }
                    );
                            
                    orcamento.dataValues.kommoResponse = orcamentoKommo;
                }
            }
        } catch (kommoErr) {
            console.error("Erro ao criar orçamento no Kommo:", kommoErr.response?.data || kommoErr.message);
        }

        await transaction.commit();
        res.status(201).json({ message: 'Orçamento criado com sucesso', orcamento });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar orçamento', error });
    }
}

// Função para consultar todos os orçamentos e seus relacionamentos
async function getOrcamentos(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { startDate, endDate, status, idVendedor, orcamento, numeroOR, idFilial } = req.query; 

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por data de início e data de fim, se fornecidos
        if (startDate) {
            const [year, month, day] = startDate.split('-');
            const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0); 
            whereConditions.createdAt = {
                [Op.gte]: start
            };
        }
        
        if (endDate) {
            const [year, month, day] = endDate.split('-');
            const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999); 
            if (!whereConditions.createdAt) {
                whereConditions.createdAt = {};
            }
            whereConditions.createdAt[Op.lte] = end;
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

        // Adicione filtro por idOrcamento, se fornecido
        if (numeroOR) {
            whereConditions.numeroOR = numeroOR;
        }

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
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
                    attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'uf', 'telefone', 'celular']
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