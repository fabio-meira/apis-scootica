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
const { Op } = require('sequelize');
const Produto = require('../models/Produto');
const Reserva = require('../models/Reserva');
const sequelize = require('../database/connection');
const Mensagem = require('../models/Mensagem');

// Função para criar uma nova Ordem de Serviço e seus pagamentos relacionados
async function postOrdemServico(req, res) {
  const transaction = await sequelize.transaction(); 
  try {
    const ordemServicoData = req.body;
    const { idEmpresa } = req.params;

    // Adiciona idEmpresa aos dados da Ordem de Serviço
    ordemServicoData.idEmpresa = idEmpresa;

    // Obter o próximo número de orçamento por idEmpresa
    const maxNumero = await OrdemServico.max('numeroOS', {
        where: { idEmpresa },
        transaction
        });
    ordemServicoData.numeroOS = (maxNumero || 0) + 1;

    // Cria a Ordem de Serviço
    const ordemServico = await OrdemServico.create(ordemServicoData, { transaction });

    // Processa os produtos, criar a reserva do produto da OS
    const produtos = await Promise.all(
      ordemServicoData.produtos.map(async (produto) => {
        const produtoDB = await Produto.findByPk(produto.idProduto, { transaction });
        if (!produtoDB) {
          throw new Error(`Produto com ID ${produto.idProduto} não encontrado.`);
        }

        if (produtoDB.movimentaEstoque) {
            if (produtoDB.movimentaEstoque && produto.quantidade > produtoDB.estoqueDisponivel) {
                const error = new Error(`Estoque insuficiente para o produto ${produtoDB.descricao}. Disponível: ${produtoDB.estoqueDisponivel}, Solicitado: ${produto.quantidade}`);
                error.status = 422;
                throw error;
            }

            // Atualiza o estoque reservado e disponível
            await Produto.update(
                {
                    estoqueReservado: produtoDB.estoqueReservado + produto.quantidade,
                    // estoqueDisponivel: produtoDB.estoqueDisponivel - produto.quantidade
                    estoqueDisponivel: produtoDB.estoque - (produtoDB.estoqueReservado + produto.quantidade)
                },
                { where: { id: produto.idProduto }, transaction }
            );

            // Enviar uma mensagem quando o estoque disponível = 0
            const disponivel =  produtoDB.estoque - (produtoDB.estoqueReservado + produto.quantidade)
            if (disponivel === 0) {
                await Mensagem.create({
                    idEmpresa: idEmpresa, 
                    chave: `Produto`,
                    mensagem: `O produto ${produtoDB.descricao} está sem estoque disponível.`,
                    lida: false,
                    observacoes: `Verificar necessidade de reposição para o produto ${produtoDB.descricao}.`
                }, { transaction });
            };

            // Enviar uma mensagem quando o estoque disponível = estoque mínimo
            if (disponivel === produtoDB.estoqueMinimo) {
                await Mensagem.create({
                    idEmpresa: idEmpresa, 
                    chave: `Produto`,
                    mensagem: `O produto ${produtoDB.descricao} atingiu seu estoque mínimo (${produtoDB.estoqueMinimo}).`,
                    lida: false,
                    observacoes: `Verificar necessidade de reposição para o produto ${produtoDB.descricao}.`
                }, { transaction });
            };

            // Criação da reserva no banco
            await Reserva.create({
                idEmpresa: ordemServicoData.idEmpresa,
                idOrdemServico: ordemServico.id,
                idProduto: produto.idProduto,
                quantidade: produto.quantidade,
                situacao: 1,
                createdAt: new Date(),
                updatedAt: new Date()
                }, { transaction });
        }

            return { ...produto, idOrdemServico: ordemServico.id };
        })
    );

    // Cria os produtos vinculados à Ordem de Serviço
    await OrdemProduto.bulkCreate(produtos, { transaction });

    // Cria os totais com idOrdemServico
    const totais = {
      ...ordemServicoData.totais,
      idOrdemServico: ordemServico.id
    };
    await OrdemProdutoTotal.create(totais, { transaction });

    // Prepara os dados dos pagamentos com idOrdemServico
    const pagamentos = ordemServicoData.pagamentos.map(pagamento => ({
      ...pagamento,
      idOrdemServico: ordemServico.id,
      idEmpresa: ordemServico.idEmpresa
    }));
    // Cria os pagamentos em lote
    await Pagamento.bulkCreate(pagamentos, { transaction });

    // Verifica se a ordem de serviço está vinculado a um orçamento
    const existOrcamento = await Orcamento.findOne({
      where: { id: ordemServicoData.idOrcamento || null },
      transaction
    });

    // Atualiza a tabela Orcamento no campo idOrdemServico
    if (existOrcamento) {
      await Orcamento.update(
        {
          idOrdemServico: ordemServico.id,
          situacao: 1
        },
        { where: { id: ordemServicoData.idOrcamento }, transaction }
      );
    }

    await transaction.commit(); 

    res.status(201).json({ message: 'Ordem de serviço criada com sucesso', ordemServico });

  }catch (error) {
    await transaction.rollback();
    console.error(error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({ message: error.message });
  }
}

// Função para consultar todas as ordens de serviço e seus relacionamentos
async function getOrdemServico(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { startDate, endDate, dataEstimada, idVendedor, status, idOrcamento, numeroOS, numeroOR, os } = req.query; 

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

        // Adicione filtro por data estimada, se fornecido
        if (dataEstimada) {
            const [year, month, day] = dataEstimada.split('-');
        
            // Cria o início e fim do dia no horário local (GMT-3) e converte para UTC
            const start = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0));
            start.setUTCHours(start.getUTCHours() - 3); // GMT-3
        
            const end = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
            end.setUTCHours(end.getUTCHours() - 3); // GMT-3
        
            whereConditions.dtEstimadaEntrega = {
                [Op.between]: [start, end]
            };
        }

        // Adicione filtro por idVendedor, se fornecido
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

        // Adicione filtro por número da OS, se fornecido
        if (numeroOS) {
            whereConditions.numeroOS = numeroOS; 
        }

        // Adicione filtro por ordem de servico, se fornecido
        if (os) {
            whereConditions.id = os; 
        }

        const ordemServico = await OrdemServico.findAll({
            where: whereConditions,
            include: [
                {
                    model: Orcamento,
                    as: 'orcamento',
                    attributes: ['id', 'numeroOR'], 
                    // somente aplica o JOIN se usuário informou filtro numeroOR
                    ...(numeroOR ? {
                        where: { numeroOR },
                        required: true
                        } : {})
                },
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
                idVenda: null,
                situacao: {
                    [Op.ne]: 4  // Situação diferente de 4 (OS cancelada)
                }
            },
            include: [
                {
                    model: Orcamento,
                    as: 'orcamento',
                    attributes: ['id', 'numeroOR'] 
                },
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
                    model: Orcamento,
                    as: 'orcamento',
                    attributes: ['id', 'numeroOR'] 
                },
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

        // Garante que haja um array de pagamentos
        const pagamentos = ordemServico.pagamentos || [];

        // Soma os pagamentos adiantados
        const valorAdiantamento = pagamentos
        .filter(p => p.adiantamento === true)
        .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);

        // Soma os pagamentos não adiantados
        const valorPagoVenda = pagamentos
        .filter(p => p.adiantamento === false)
        .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
        
        const output = {
            ...ordemServico.toJSON(),
            valorAdiantamento,
            valorPagoVenda
        };
      
        return res.status(200).json(output);         
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