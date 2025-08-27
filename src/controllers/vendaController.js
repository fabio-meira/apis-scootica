const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Medico = require('../models/Medico');
const Receituario = require('../models/Receita');
const Laboratorio = require('../models/Laboratorio');
const Pagamento = require('../models/Pagamento');
const Parcela = require('../models/Parcela');
const Empresa = require('../models/Empresa');
const VendaProduto = require('../models/VendaProduto');
const OrdemServico = require('../models/OrdemServico');
const { Op } = require('sequelize')
const sequelize = require('../database/connection');
const Reserva = require('../models/Reserva');
const Produto = require('../models/Produto');
const Mensagem = require('../models/Mensagem');
const { uploadToS3 } = require('../middleware/s3');
const { BUCKET_IMAGES } = require('../../config/s3Client');
const OrdemServicoArquivo = require('../models/OrdemServicoArquivo');

// Função para sanear os campos
function sanitizeVendaData(data) {
  const parseNum = (val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  return {
    ...data,
    idCliente: parseNum(data.idCliente),
    idVendedor: parseNum(data.idVendedor),
    idCaixa: parseNum(data.idCaixa),
    idOrdemServico: parseNum(data.idOrdemServico),
    idReceita: parseNum(data.idReceita),
    idLaboratorio: parseNum(data.idLaboratorio),
    aro: parseNum(data.aro),
    ponte: parseNum(data.ponte),
    diagonalMaior: parseNum(data.diagonalMaior),
    verticalAro: parseNum(data.verticalAro),
    valorTotal: parseNum(data.valorTotal),
    dtEstimadaEntrega: data.dtEstimadaEntrega || null,
    enviadoLaboratorio: data.enviadoLaboratorio ?? false,
  };
}

// Função para criar uma nova venda e seus produtos, ordem de serviço, totais e pagamentos relacionados
async function postVenda(req, res) {
    const transaction = await sequelize.transaction();
    try {
        // const vendaData = req.body;
        const vendaData = JSON.parse(req.body.body || '{}');
        const { idEmpresa } = req.params;

        // Adiciona idEmpresa aos dados de venda
        vendaData.idEmpresa = idEmpresa;

        // Obter o próximo número de orçamento por idEmpresa
        const maxNumero = await Venda.max('numeroVenda', {
            where: { idEmpresa },
            transaction
            });
        vendaData.numeroVenda = (maxNumero || 0) + 1;

        // Cria uma venda
        const venda = await Venda.create(vendaData, { transaction });

        // Cria os produtos com idVenda
        const produtos = vendaData.produtos.map(produto => ({
            ...produto,
            idVenda: venda.id
        }));

        await VendaProduto.bulkCreate(produtos, { transaction });
        
        // Cria os totais com idVenda
        const totais = {
            ...vendaData.totais,
            idVenda: venda.id
        };
        await OrdemProdutoTotal.create(totais, { transaction });

        // Prepara os dados dos pagamentos
        for (const pagamento of vendaData.pagamentos) {
            // Verifica se já existe um registro de adiantamento
            const existingPayment = await Pagamento.findOne({
                where: {
                    idOrdemServico: pagamento.idOrdemServico || null,
                    idVenda: null,
                    adiantamento: true
                }
            });

            if (existingPayment) {
                // Atualiza o registro existente com idVenda
                existingPayment.idVenda = venda.id;
                await existingPayment.save();
            } else {
                // Prepara o novo pagamento com idVenda
                const newPayment = {
                    ...pagamento,
                    idVenda: venda.id,
                    idEmpresa: venda.idEmpresa
                };
                // Cria o novo pagamento
                //await Pagamento.create(newPayment, { transaction });
                const createdPayment = await Pagamento.create(newPayment, { transaction });

                // Se for cartão de crédito, cria as parcelas
                if (pagamento.statusRecebimento === 'Credito' && pagamento.parcelas && pagamento.valor) {
                    for (let i = 0; i < pagamento.quantidadeParcelas; i++) {
                        const vencimento = new Date(pagamento.dataVencimento); // Assume que a data da primeira parcela vem no corpo
                        vencimento.setMonth(vencimento.getMonth() + i);

                        await Parcela.create({
                            idPagamento: createdPayment.id, // ID do pagamento
                            idEmpresa: venda.idEmpresa,
                            quantidade: pagamento.parcelas,
                            dataVencimento: vencimento,
                            outrasInformacoes: `Parcela ${i + 1} de ${pagamento.parcelas} - Valor: R$ ${pagamento.parcelas}`,
                            tipoPagamento: 'Credito'
                        }, { transaction });
                    }
                }
            }
        }
        
        // Verifica se a ordem de serviço existe
        const existOrdemServico = await OrdemServico.findOne({
            where: { id: vendaData.idOrdemServico || null}
        });

        // Atualiza a tabela OrdemServico no campo idVenda
        if (existOrdemServico) {
            await OrdemServico.update(
                { idVenda: venda.id, situacao: 1 },
                { where: { id: vendaData.idOrdemServico }, transaction }
            );

            // Baixa a reserva de estoque da OS e insere o idVenda
            await Reserva.update(
                { idVenda: venda.id, situacao: 2, updatedAt: new Date()
                },
                { where: { idOrdemServico: vendaData.idOrdemServico, idEmpresa}, transaction}
            );
            
            // Inicia o processo para identificar os produtos da O.S.
            const itensDaOS = await Reserva.findAll({
                where: {
                    idOrdemServico: vendaData.idOrdemServico,
                    idEmpresa,
                },
                transaction
            });
            
            const idsProdutosOS = itensDaOS.map(item => item.idProduto);
              
            // Iterar sobre os itens da venda
            for (const item of vendaData.produtos) {
                const produtoDB = await Produto.findByPk(item.idProduto, { transaction });
                if (!produtoDB) {
                    throw new Error(`Produto com ID ${item.idProduto} não encontrado.`);
                }
                
                if (produtoDB.movimentaEstoque) {
                    const veioDaOS = idsProdutosOS.includes(item.idProduto);
                
                    if (veioDaOS) {
                    // Produto já estava reservado pela OS
                    await Produto.update(
                        {
                        estoqueReservado: produtoDB.estoqueReservado - item.quantidade,
                        estoque: produtoDB.estoque - item.quantidade,
                        estoqueDisponivel: produtoDB.estoque - produtoDB.estoqueReservado
                        },
                        { where: { id: item.idProduto }, transaction }
                    );
                    } else {
                    // Produto foi adicionado diretamente na venda
                        await Produto.update(
                            {
                            estoque: produtoDB.estoque - item.quantidade,
                            estoqueDisponivel: produtoDB.estoqueDisponivel - item.quantidade
                            },
                            { where: { id: item.idProduto }, transaction }
                        );

                        // verifica se o produto ficou sem estoque e notifica em mensagens
                        const disponivelVenda =  (produtoDB.estoque - item.quantidade) - produtoDB.estoqueReservado
                        if (disponivelVenda === 0) {
                            await Mensagem.create({
                              idEmpresa: idEmpresa, 
                              chave: `Produto`,
                              mensagem: `O produto ${produtoDB.descricao} está sem estoque disponível.`,
                              lida: false,
                              observacoes: `Verificar necessidade de reposição para o produto ${produtoDB.descricao}.`
                            }, { transaction });
                        };
                    }
                }
            };
        }else {
            // Processa os produtos, e atualiza tabela de produtos com a venda
            const produtosVenda = await Promise.all(
                vendaData.produtos.map(async (produto) => {
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

                    // Atualiza o estoque e disponível
                    await Produto.update(
                        {
                            estoque: produtoDB.estoque - produto.quantidade,
                            estoqueDisponivel: (produtoDB.estoque - produto.quantidade) - produtoDB.estoqueReservado
                        },
                        { where: { id: produto.idProduto }, transaction }
                    );
                    
                    // Criar registro na tabela de mensagem, se estoque disponível = 0
                    const disponivelVenda =  (produtoDB.estoque - produto.quantidade) - produtoDB.estoqueReservado
                    if (disponivelVenda === 0) {
                        await Mensagem.create({
                          idEmpresa: idEmpresa, 
                          chave: `Produto`,
                          mensagem: `O produto ${produtoDB.descricao} está sem estoque disponível.`,
                          lida: false,
                          observacoes: `Verificar necessidade de reposição para o produto ${produtoDB.descricao}.`
                        }, { transaction });
                    };

                    // Enviar uma mensagem quando o estoque disponível = estoque mínimo
                    if (disponivelVenda === produtoDB.estoqueMinimo) {
                        await Mensagem.create({
                            idEmpresa: idEmpresa, 
                            chave: `Produto`,
                            mensagem: `O produto ${produtoDB.descricao} atingiu seu estoque mínimo (${produtoDB.estoqueMinimo}).`,
                            lida: false,
                            observacoes: `Verificar necessidade de reposição para o produto ${produtoDB.descricao}.`
                        }, { transaction });
                    };
                }
        
                    return { ...produto, idVenda: venda.id };
                })
            );
        };

        // Verifica se tem arquivo para ser anexado na Venda
        if (req.files && req.files.length > 0) {
        const uploads = await Promise.all(
            req.files.map(async (file) => {
            const { key } = await uploadToS3(file, BUCKET_IMAGES, 'OS/');
            return {
                originalname: file.originalname,
                mimetype: file.mimetype,
                key
            };
            })
        );

        await Promise.all(
            uploads.map(upload => 
            OrdemServicoArquivo.create({
                idEmpresa,
                idOrdemServico: vendaData.idOrdemServico || null,
                idVenda: venda.id,
                nomeArquivo: upload.originalname,
                caminhoS3: upload.key,
                tipoArquivo: upload.mimetype
            }, { transaction })
            )
        );
        };

        if (vendaData.idOrdemServico != null) {
            await OrdemServicoArquivo.update(
                { idVenda: venda.id },
                {
                where: {
                    idOrdemServico: vendaData.idOrdemServico,
                    idVenda: null
                },
                transaction
                }
            );
        };

        await transaction.commit();

        res.status(201).json({ message: 'Venda criada com sucesso', vendaData });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        const statusCode = error.status || 500;
        // res.status(500).json({ message: 'Erro ao criar venda', error });
        res.status(statusCode).json({ message: error.message });
    }
}

// Função para consultar todas as vendas e seus relacionamentos
async function getVenda(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { startDate, endDate, dataEstimada, idVendedor, status, idOrdemServico, numeroOS, idVenda, numeroVenda } = req.query; 

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
        // if (dataEstimada) {
        //     // Cria um objeto Date no horário local
        //     const date = new Date(`${dataEstimada}`);
        
        //     // Formata a data e hora no formato local
        //     const ano = date.getFullYear();
        //     const mes = String(date.getMonth() + 1).padStart(2, '0');
        //     const dia = String(date.getDate()).padStart(2, '0');
        //     const hora = '21';
        //     const minutos = '00';
        //     const segundos = '00';
        
        //     // Converte para o formato YYYY-MM-DD HH:MM:SS no horário local
        //     const dataEstimadaFormatada = `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
        
        //     // Define o filtro para a consulta
        //     whereConditions.dtEstimadaEntrega = dataEstimadaFormatada;
        // }
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

        // Adicione filtro por idFornecedor, se fornecido
        if (idVendedor) {
            whereConditions.idVendedor = idVendedor;
        }
        
        // Adicione filtro por status, se fornecido
        if (status) {
            whereConditions.situacao = status; 
        }

        // Adicione filtro por id ordem de servico, se fornecido
        if (idOrdemServico) {
            whereConditions.idOrdemServico = idOrdemServico; 
        }

        // Adicione filtro por id venda, se fornecido
        if (idVenda) {
            whereConditions.id = idVenda; 
        }

        // Adicione filtro por número venda, se fornecido
        if (numeroVenda) {
            whereConditions.numeroVenda = numeroVenda; 
        }

        const venda = await Venda.findAll({
            where: whereConditions,
            include: [
                {
                    model: OrdemServico,
                    as: 'ordemServico',
                    attributes: ['id', 'numeroOS'],
                    // somente aplica o JOIN se usuário informou filtro numeroOS
                    ...(numeroOS ? {
                      where: { numeroOS },
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
                    model: VendaProduto,
                    as: 'produtos'
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
                    // incluir as parcelas de pagamento, caso tenha
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                },
                {
                    model: OrdemServicoArquivo,
                    as: 'ordemServicoArquivo'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });
        if (!venda) {
            return res.status(404).json({ message: 'Nenhuma venda localizada' });
        }
        res.status(200).json(venda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar vendas', error });
    }
}

// Função para buscar por um Id de venda
async function getIdVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;
        const venda = await Venda.findOne({
            where: { idEmpresa: idEmpresa,
                id: id
            },
            include: [
                {
                    model: OrdemServico,
                    as: 'ordemServico',
                    attributes: ['id', 'numeroOS'] 
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
                    model: VendaProduto,
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
                {
                    model: OrdemServico,
                    as: 'ordemServico',
                    attributes: ['createdAt']
                },
                {
                    model: OrdemServicoArquivo,
                    as: 'ordemServicoArquivo'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!venda) {
            return res.status(404).json({ message: 'Venda não encontrada' });
        }

        // Garante que haja um array de pagamentos
        const pagamentos = venda.pagamentos || [];

        // Soma os pagamentos adiantados
        const valorAdiantamento = pagamentos
        .filter(p => p.adiantamento === true)
        .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);

        // Soma os pagamentos não adiantados
        const valorPagoVenda = pagamentos
        .filter(p => p.adiantamento === false)
        .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
        
        const output = {
            ...venda.toJSON(),
            valorAdiantamento,
            valorPagoVenda
        };
      
        return res.status(200).json(output);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar uma venda', error });
    }
}

// Função para buscar por vendas associadas a um idCaixa
async function getCaixaIdVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;
        const venda = await Venda.findAll({
            where: { idEmpresa: idEmpresa,
                idCaixa: id
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['nome'] 
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!venda) {
            return res.status(404).json({ message: 'Venda não encontrada' });
        }
        
        res.status(200).json(venda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar uma venda', error });
    }
}

// Função para atualizar uma venda pelo Id
async function putVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const vendaData = req.body; 

        // Atualiza a venda no banco de dados
        const [updated] = await Venda.update(vendaData, {
            where: { 
                id: id,
                idEmpresa: idEmpresa
            }
        });

        if (updated) {
            // Busca a venda atualizada para retornar na resposta
            const venda = await Venda.findOne({ where: { id: id, idEmpresa: idEmpresa } });
            res.status(200).json({ message: 'Venda atualizada com sucesso', venda });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Venda não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar venda', error });
    }
}

// Função para deletar uma venda pelo id
async function deleteVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a venda no banco de dados
        const deleted = await Venda.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Venda deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Venda não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar venda', error });
    }
}

module.exports = {
    postVenda,
    getVenda,
    getIdVenda,
    getCaixaIdVenda,
    putVenda,
    deleteVenda 
};