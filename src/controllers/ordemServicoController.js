const OrdemServico = require('../models/OrdemServico');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const OrdemProduto = require('../models/OrdemProduto');
const Orcamento = require('../models/Orcamento');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Receituario = require('../models/Receita');
const Medico = require('../models/Medico');
const Laboratorio = require('../models/Laboratorio');
const Pagamento = require('../models/Pagamento');
const Empresa = require('../models/Empresa');
const { Op } = require('sequelize')

// Função para criar uma nova Ordem de Serviço e seus pagamentos relacionados
async function postOrdemServico(req, res) {
    try {
        const ordemServicoData = req.body;
        const { idEmpresa } = req.params;

        // Adiciona idEmpresa aos dados da Ordem de Serviço
        ordemServicoData.idEmpresa = idEmpresa;

        // Cria a Ordem de Serviço
        const ordemServico = await OrdemServico.create(ordemServicoData);

        // Cria os produtos com idOrdemServico
        const produtos = ordemServicoData.produtos.map(produto => ({
            ...produto,
            idOrdemServico: ordemServico.id
        }));
        await OrdemProduto.bulkCreate(produtos);
        
        // Cria os totais com idOrdemServico
        const totais = {
            ...ordemServicoData.totais,
            idOrdemServico: ordemServico.id
        };
        await OrdemProdutoTotal.create(totais);

        // Prepara os dados dos pagamentos com idOrdemServico
        const pagamentos = ordemServicoData.pagamentos.map(pagamento => ({
            ...pagamento,
            idOrdemServico: ordemServico.id
        }));
        // Cria os pagamentos em lote
        await Pagamento.bulkCreate(pagamentos);

        // Verifica se a ordem de serviço existe
        const existOrcamento = await Orcamento.findOne({
            where: { id: ordemServicoData.idOrcamento || null}
        });

        // Atualiza a tabela OrdemServico no campo idVenda
        if(existOrcamento) {
            await Orcamento.update(
                { idOrdemServico: ordemServico.id,
                  situacao: 1  
                },
                { where: { id: ordemServicoData.idOrcamento } }
            );
        }

        res.status(201).json({ message: 'Ordem de serviço criada com sucesso', ordemServico });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar ordem de serviço', error });
    }
}


// Função para consultar todas as ordens de serviço e seus relacionamentos
async function getOrdemServico(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { startDate, endDate, dataEstimada, idVendedor, status, idOrcamento, os } = req.query; 

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
        if (dataEstimada) {
            // Cria um objeto Date no horário local
            const date = new Date(`${dataEstimada}`);
        
            // Formata a data e hora no formato local
            const ano = date.getFullYear();
            const mes = String(date.getMonth() + 1).padStart(2, '0');
            const dia = String(date.getDate()).padStart(2, '0');
            const hora = '21';
            const minutos = '00';
            const segundos = '00';
        
            // Converte para o formato YYYY-MM-DD HH:MM:SS no horário local
            const dataEstimadaFormatada = `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
        
            // Define o filtro para a consulta
            whereConditions.dtEstimadaEntrega = dataEstimadaFormatada;
        }

        // Adicione filtro por idFornecedor, se fornecido
        if (idVendedor) {
            whereConditions.idVendedor = idVendedor;
        }
        
        // Adicione filtro por status, se fornecido
        if (status) {
            whereConditions.situacao = status; 
        }

        // Adicione filtro por orcamento, se fornecido
        if (idOrcamento) {
            whereConditions.idOrcamento = idOrcamento; 
        }

        // Adicione filtro por ordem de servico, se fornecido
        if (os) {
            whereConditions.id = os; 
        }

        const ordemServico = await OrdemServico.findAll({
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
                    model: OrdemProduto,
                    as: 'produtos'
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(ordemServico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar ordem de serviço', error });
    }
}

// Função para consultar todas as ordens de serviço e seus relacionamentos
async function getOrdemServicoSV(req, res) {
    try {
        const { idEmpresa } = req.params;
        const ordemServico = await OrdemServico.findAll({
            where: { idEmpresa: idEmpresa,
                idVenda: null
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
                    model: OrdemProduto,
                    as: 'produtos'
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(ordemServico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar ordem de serviço', error });
    }
}

// Função para buscar por um Id de ordem de serviço
async function getIdOrdemServico(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;
        const ordemServico = await OrdemServico.findOne({
            where: { idEmpresa: idEmpresa,
                id: id
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
                    model: OrdemProduto,
                    as: 'produtos'
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!ordemServico) {
            return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }
        
        res.status(200).json(ordemServico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar ordem de serviço', error });
    }
}

// Função para atualizar uma ordem de serviço
async function putOrdemServico(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const ordemServicoData = req.body; 

        // Atualiza a ordem de serviço no banco de dados
        const [updated] = await OrdemServico.update(ordemServicoData, {
            where: { 
                id: id,
                idEmpresa: idEmpresa
            }
        });

        if (updated) {
            // Busca a ordem de serviço atualizada para retornar na resposta
            const ordemServico = await OrdemServico.findOne({ where: { id: id, idEmpresa: idEmpresa } });
            res.status(200).json({ message: 'Ordem de serviço atualizada com sucesso', ordemServico });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Ordem de serviço não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar ordem de serviço', error });
    }
}

// Função para deletar uma ordem de serviço pelo id
async function deleteOrdemServico(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a ordem de serviço no banco de dados
        const deleted = await OrdemServico.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Ordem de serviço deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Ordem de serviço não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar ordem de serviço', error });
    }
}

module.exports = {
    postOrdemServico,
    getOrdemServico,
    getOrdemServicoSV,
    getIdOrdemServico,
    putOrdemServico,
    deleteOrdemServico 
};