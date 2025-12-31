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
const { uploadToS3 } = require('../middleware/s3');
const { BUCKET_IMAGES } = require('../../config/s3Client');
const OrdemServicoArquivo = require('../models/OrdemServicoArquivo');
const Caixa = require('../models/Caixa');

// Função para criar uma nova Ordem de Serviço e seus pagamentos relacionados
// async function postOrdemServico(req, res) {

//   // const transaction = await sequelize.transaction(); 
//   let transaction;

//   try {
//     // const ordemServicoData = req.body;
//     const ordemServicoData = JSON.parse(req.body.body || '{}');
//     const { idEmpresa } = req.params;

//     // Adiciona idEmpresa aos dados da Ordem de Serviço
//     ordemServicoData.idEmpresa = idEmpresa;

//     // Identificar o idFilial para consulta do próximo número venda
//     const idFilial = ordemServicoData.idFilial;

//     // Consulta o último registro na tabela caixa
//     const ultimoCaixa = await Caixa.findOne({
//         where: { idEmpresa, idFilial }, 
//         order: [['createdAt', 'DESC']], 
//         // transaction
//     });

//     // Verifica se o último caixa encontrado tem a situação igual a 1 (caixa aberto)
//     if (!ultimoCaixa || ultimoCaixa.situacao !== 1) {
//         return res.status(422).json({ message: 'Não é possível cadastrar a OS. O caixa está fechado.' });
//     };

//     transaction = await sequelize.transaction();

//     // Obter o próximo número de orçamento por idEmpresa
//     const maxNumero = await OrdemServico.max('numeroOS', {
//         where: { 
//             idEmpresa,
//             idFilial, 
//         },
//         transaction
//     });

//     // Identificar o idFilial para consulta do próximo número venda
//     ordemServicoData.numeroOS = (maxNumero || 0) + 1;

//     // Cria a Ordem de Serviço
//     const ordemServico = await OrdemServico.create(ordemServicoData, { transaction });

//     // Processa os produtos, criar a reserva do produto da OS
//     const produtos = await Promise.all(
//       ordemServicoData.produtos.map(async (produto) => {
//         const produtoDB = await Produto.findByPk(produto.idProduto, { transaction });
//         if (!produtoDB) {
//           throw new Error(`Produto com ID ${produto.idProduto} não encontrado.`);
//         }

//         if (produtoDB.movimentaEstoque) {
//             if (produtoDB.movimentaEstoque && produto.quantidade > produtoDB.estoqueDisponivel) {
//                 const error = new Error(`Estoque insuficiente para o produto ${produtoDB.descricao}. Disponível: ${produtoDB.estoqueDisponivel}, Solicitado: ${produto.quantidade}`);
//                 error.status = 422;
//                 throw error;
//             }

//             // Atualiza o estoque reservado e disponível
//             await Produto.update(
//                 {
//                     estoqueReservado: produtoDB.estoqueReservado + produto.quantidade,
//                     // estoqueDisponivel: produtoDB.estoqueDisponivel - produto.quantidade
//                     estoqueDisponivel: produtoDB.estoque - (produtoDB.estoqueReservado + produto.quantidade)
//                 },
//                 { where: { id: produto.idProduto }, transaction }
//             );

//             // Enviar uma mensagem quando o estoque disponível = 0
//             const disponivel =  produtoDB.estoque - (produtoDB.estoqueReservado + produto.quantidade)
//             if (disponivel === 0) {
//                 await Mensagem.create({
//                     idEmpresa: idEmpresa, 
//                     chave: `Produto`,
//                     mensagem: `O produto ${produtoDB.descricao} está sem estoque disponível.`,
//                     lida: false,
//                     observacoes: `Verificar necessidade de reposição para o produto ${produtoDB.descricao}.`
//                 }, { transaction });
//             };

//             // Enviar uma mensagem quando o estoque disponível = estoque mínimo
//             if (disponivel === produtoDB.estoqueMinimo) {
//                 await Mensagem.create({
//                     idEmpresa: idEmpresa, 
//                     chave: `Produto`,
//                     mensagem: `O produto ${produtoDB.descricao} atingiu seu estoque mínimo (${produtoDB.estoqueMinimo}).`,
//                     lida: false,
//                     observacoes: `Verificar necessidade de reposição para o produto ${produtoDB.descricao}.`
//                 }, { transaction });
//             };

//             // Criação da reserva no banco
//             await Reserva.create({
//                 idEmpresa: ordemServicoData.idEmpresa,
//                 idOrdemServico: ordemServico.id,
//                 idProduto: produto.idProduto,
//                 quantidade: produto.quantidade,
//                 situacao: 1,
//                 createdAt: new Date(),
//                 updatedAt: new Date()
//                 }, { transaction });
//         }

//             return { ...produto, idOrdemServico: ordemServico.id };
//         })
//     );

//     // Cria os produtos vinculados à Ordem de Serviço
//     await OrdemProduto.bulkCreate(produtos, { transaction });

//     // Cria os totais com idOrdemServico
//     const totais = {
//       ...ordemServicoData.totais,
//       idOrdemServico: ordemServico.id
//     };
//     await OrdemProdutoTotal.create(totais, { transaction });

//     // Identificar o caixa para inserir nos pagamentos
//     const idCaixa = ordemServico.idCaixa;

//     // Prepara os dados dos pagamentos com idOrdemServico
//     const pagamentos = ordemServicoData.pagamentos.map(pagamento => ({
//       ...pagamento,
//       idCaixa: idCaixa,
//       idFilial: idFilial,
//       idOrdemServico: ordemServico.id,
//       idEmpresa: ordemServico.idEmpresa
//     }));
//     // Cria os pagamentos em lote
//     await Pagamento.bulkCreate(pagamentos, { transaction });

//     // Verifica se a ordem de serviço está vinculado a um orçamento
//     const existOrcamento = await Orcamento.findOne({
//       where: { id: ordemServicoData.idOrcamento || null },
//       transaction
//     });

//     // Atualiza a tabela Orcamento no campo idOrdemServico
//     if (existOrcamento) {
//       await Orcamento.update(
//         {
//           idOrdemServico: ordemServico.id,
//           situacao: 1
//         },
//         { where: { id: ordemServicoData.idOrcamento }, transaction }
//       );
//     }

//     // Verifica se tem arquivo para ser anexado na O.S.
//     if (req.files && req.files.length > 0) {
//         const uploads = await Promise.all(
//             req.files.map(async (file) => {
//             const { key } = await uploadToS3(file, BUCKET_IMAGES, 'OS/');
            
//             return {
//                 originalname: file.originalname,
//                 mimetype: file.mimetype,
//                 key
//             };
//             })
//         );

//         await Promise.all(
//             uploads.map(upload => 
//             OrdemServicoArquivo.create({
//                 idEmpresa, 
//                 idOrdemServico: ordemServico.id,
//                 nomeArquivo: upload.originalname,
//                 caminhoS3: upload.key,
//                 tipoArquivo: upload.mimetype
//             }, { transaction })
//             )
//         );
//     }

//     await transaction.commit(); 

//     res.status(201).json({ message: 'Ordem de serviço criada com sucesso', ordemServico });

//   }catch (error) {
//     await transaction.rollback();
//     console.error(error);
//     const statusCode = error.status || 500;
//     res.status(statusCode).json({ message: error.message });
//   }
// }

// Função para criar uma nova Ordem de Serviço e seus pagamentos relacionados
async function postOrdemServico(req, res) {
  let transaction;

  try {
    const ordemServicoData = JSON.parse(req.body.body || '{}');
    const { idEmpresa } = req.params;

    ordemServicoData.idEmpresa = idEmpresa;

    const { idFilial, produtos, totais, pagamentos } = ordemServicoData;


    // VALIDAÇÕES OBRIGATÓRIAS
    if (!idFilial) {
      return res.status(422).json({ message: 'Filial não informada.' });
    }

    if (!Array.isArray(produtos) || produtos.length === 0) {
      return res.status(422).json({
        message: 'A Ordem de Serviço deve conter ao menos um produto.'
      });
    }
    
    // VALIDAR CAIXA ABERTO
    const ultimoCaixa = await Caixa.findOne({
      where: { idEmpresa, idFilial },
      order: [['createdAt', 'DESC']]
    });

    if (!ultimoCaixa || ultimoCaixa.situacao !== 1) {
      return res.status(422).json({
        message: 'Não é possível cadastrar a OS. O caixa está fechado.'
      });
    }
    
    // INÍCIO DA TRANSACTION
    transaction = await sequelize.transaction();

    //  GERAR NÚMERO DA OS
    const maxNumero = await OrdemServico.max('numeroOS', {
      where: { idEmpresa, idFilial },
      transaction
    });

    ordemServicoData.numeroOS = (maxNumero || 0) + 1;
      
    // CRIAR ORDEM DE SERVIÇO
    const ordemServico = await OrdemServico.create(ordemServicoData, {
      transaction
    });

    // PROCESSAR PRODUTOS
    const ordemProdutos = [];

    for (const item of produtos) {
      const produtoDB = await Produto.findByPk(item.idProduto, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!produtoDB) {
        throw Object.assign(
          new Error(`Produto ${item.idProduto} não encontrado.`),
          { status: 422 }
        );
      }

      if (produtoDB.movimentaEstoque) {
        if (item.quantidade > produtoDB.estoqueDisponivel) {
          throw Object.assign(
            new Error(
              `Estoque insuficiente para ${produtoDB.descricao}. Disponível: ${produtoDB.estoqueDisponivel}`
            ),
            { status: 422 }
          );
        }

        const novoReservado = produtoDB.estoqueReservado + item.quantidade;
        const novoDisponivel = produtoDB.estoque - novoReservado;

        await Produto.update(
          {
            estoqueReservado: novoReservado,
            estoqueDisponivel: novoDisponivel
          },
          {
            where: { id: produtoDB.id },
            transaction
          }
        );

        await Reserva.create(
          {
            idEmpresa,
            idOrdemServico: ordemServico.id,
            idProduto: produtoDB.id,
            quantidade: item.quantidade,
            situacao: 1
          },
          { transaction }
        );

        if (novoDisponivel === 0 || novoDisponivel === produtoDB.estoqueMinimo) {
          await Mensagem.create(
            {
              idEmpresa,
              chave: 'Produto',
              mensagem:
                novoDisponivel === 0
                  ? `O produto ${produtoDB.descricao} está sem estoque disponível.`
                  : `O produto ${produtoDB.descricao} atingiu o estoque mínimo.`,
              lida: false
            },
            { transaction }
          );
        }
      }

      ordemProdutos.push({
        ...item,
        idOrdemServico: ordemServico.id
      });
    }

    await OrdemProduto.bulkCreate(ordemProdutos, {
      transaction,
      validate: true
    });

    // TOTAIS    
    await OrdemProdutoTotal.create(
      {
        ...totais,
        idOrdemServico: ordemServico.id
      },
      { transaction }
    );

    // PAGAMENTOS
    if (Array.isArray(pagamentos) && pagamentos.length > 0) {
      const pagamentosData = pagamentos.map(p => ({
        ...p,
        idEmpresa,
        idFilial,
        idCaixa: ordemServico.idCaixa,
        idOrdemServico: ordemServico.id
      }));

      await Pagamento.bulkCreate(pagamentosData, {
        transaction,
        validate: true
      });
    }

    // VINCULAR ORÇAMENTO
    if (ordemServicoData.idOrcamento) {
      await Orcamento.update(
        {
          idOrdemServico: ordemServico.id,
          situacao: 1
        },
        {
          where: {
            id: ordemServicoData.idOrcamento,
            idEmpresa
          },
          transaction
        }
      );
    }

    // ANEXOS
    if (req.files?.length) {
      for (const file of req.files) {
        const { key } = await uploadToS3(file, BUCKET_IMAGES, 'OS/');

        await OrdemServicoArquivo.create(
          {
            idEmpresa,
            idOrdemServico: ordemServico.id,
            nomeArquivo: file.originalname,
            caminhoS3: key,
            tipoArquivo: file.mimetype
          },
          { transaction }
        );
      }
    }

    // COMMIT
    await transaction.commit();

    return res.status(201).json({
      message: 'Ordem de serviço criada com sucesso',
      ordemServico
    });

  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }

    console.error(error);

    return res.status(error.status || 500).json({
      message: error.message || 'Erro ao criar Ordem de Serviço'
    });
  }
}

// Função para consultar todas as ordens de serviço e seus relacionamentos
async function getOrdemServico(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { startDate, endDate, dataEstimada, idVendedor, status, idOrcamento, numeroOS, numeroOR, os, idFilial } = req.query; 

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

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
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
                {
                    model: OrdemServicoArquivo,
                    as: 'ordemServicoArquivo'
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
        const { idFilial } = req.query; 

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };
        
        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
        }
        
        const ordemServico = await OrdemServico.findAll({
            where: { ...whereConditions,
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
                {
                    model: OrdemServicoArquivo,
                    as: 'ordemServicoArquivo'
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
                {
                    model: OrdemServicoArquivo,
                    as: 'ordemServicoArquivo'
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

// // Função para atualizar uma ordem de serviço
// async function putOrdemServico(req, res) {
//     try {
//         const { id } = req.params; 
//         const { idEmpresa } = req.params; 
//         const ordemServicoData = req.body; 

//         // Atualiza a ordem de serviço no banco de dados
//         const [updated] = await OrdemServico.update(ordemServicoData, {
//             where: { 
//                 id: id,
//                 idEmpresa: idEmpresa
//             }
//         });

//         if (updated) {
//             // Busca a ordem de serviço atualizada para retornar na resposta
//             const ordemServico = await OrdemServico.findOne({ where: { id: id, idEmpresa: idEmpresa } });
//             res.status(200).json({ message: 'Ordem de serviço atualizada com sucesso', ordemServico });
//         } else {
//             // Se nenhum registro foi atualizado, retorna um erro 404
//             res.status(404).json({ message: 'Ordem de serviço não encontrada' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Erro ao atualizar ordem de serviço', error });
//     }
// }

async function putOrdemServico(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { idEmpresa, id } = req.params;

    const body = JSON.parse(req.body.body || '{}');

    body.idEmpresa = idEmpresa;

    // Buscar OS existente
    const ordemServico = await OrdemServico.findOne({
      where: { id, idEmpresa },
      transaction
    });

    if (!ordemServico) {
      return res.status(404).json({ message: "Ordem de serviço não encontrada" });
    }

    // Atualizar campos da ordem de serviço
    await ordemServico.update(body, { transaction });
    
    // Atualização dos produtos
    const produtosEnviados = body.produtos || [];

    // Buscar produtos atuais no banco
    const produtosAtuais = await OrdemProduto.findAll({
      where: { idOrdemServico: id },
      transaction
    });

    const idsEnviados = produtosEnviados.map(p => p.id);

    /** Remover produtos que saíram **/
    const produtosParaExcluir = produtosAtuais.filter(p => !idsEnviados.includes(p.id));

    for (const p of produtosParaExcluir) {
      const produtoDB = await Produto.findByPk(p.idProduto, { transaction });

      if (produtoDB && produtoDB.movimentaEstoque) {
        await Produto.update(
          {
            estoqueReservado: produtoDB.estoqueReservado - p.quantidade,
            estoqueDisponivel: produtoDB.estoqueDisponivel + p.quantidade
          },
          { where: { id: produtoDB.id }, transaction }
        );
      }

      await Reserva.destroy({
        where: {
          idOrdemServico: id,
          idProduto: p.idProduto
        },
        transaction
      });

      await p.destroy({ transaction });
    }

    /** Atualizar ou inserir **/
    for (const produto of produtosEnviados) {
      const existente = produtosAtuais.find(p => p.id === produto.id);

      const produtoDB = await Produto.findByPk(produto.idProduto, { transaction });

      if (!existente) {
        /**** Inserir novo produto ***/
        if (produtoDB.movimentaEstoque) {
          if (produto.quantidade > produtoDB.estoqueDisponivel) {
            throw new Error(`Estoque insuficiente para ${produtoDB.descricao}`);
          }

          await Produto.update(
            {
              estoqueReservado: produtoDB.estoqueReservado + produto.quantidade,
              estoqueDisponivel: produtoDB.estoque - (produtoDB.estoqueReservado + produto.quantidade)
            },
            { where: { id: produto.idProduto }, transaction }
          );

          await Reserva.create({
            idEmpresa,
            idOrdemServico: id,
            idProduto: produto.idProduto,
            quantidade: produto.quantidade,
            situacao: 1
          }, { transaction });
        }

        await OrdemProduto.create({
          idOrdemServico: id,
          ...produto
        }, { transaction });
      } else {
        /**** → Atualizar produto existente ***/
        const diferenca = produto.quantidade - existente.quantidade;

        if (produtoDB.movimentaEstoque && diferenca !== 0) {
          if (diferenca > 0 && diferenca > produtoDB.estoqueDisponivel) {
            throw new Error(`Estoque insuficiente para ${produtoDB.descricao}`);
          }

          await Produto.update(
            {
              estoqueReservado: produtoDB.estoqueReservado + diferenca,
              estoqueDisponivel: produtoDB.estoqueDisponivel - diferenca
            },
            { where: { id: produto.idProduto }, transaction }
          );

          // Atualizar reserva
          await Reserva.update(
            { quantidade: produto.quantidade },
            {
              where: {
                idOrdemServico: id,
                idProduto: produto.idProduto
              },
              transaction
            }
          );
        }

        await existente.update(produto, { transaction });
      }
    }
    
    // Atualizar totais
    await OrdemProdutoTotal.update(body.totais, {
      where: { idOrdemServico: id },
      transaction
    });

    // Atualizar pagaentos
    const idFilial = ordemServico.idFilial;
    const idCaixa = ordemServico.idCaixa;

    const pagamentosEnviados = body.pagamentos || [];
    const pagamentosAtuais = await Pagamento.findAll({ where: { idOrdemServico: id }, transaction });

    const idsPagEnviados = pagamentosEnviados.map(p => p.id);

    const pagamentosParaExcluir = pagamentosAtuais.filter(p => !idsPagEnviados.includes(p.id));

    for (const p of pagamentosParaExcluir) {
      await p.destroy({ transaction });
    }

    for (const pg of pagamentosEnviados) {
      if (!pg.id) {
        await Pagamento.create({ ...pg, idCaixa, idFilial, idOrdemServico: id, idEmpresa }, { transaction });
      } else {
        const pExist = pagamentosAtuais.find(p => p.id === pg.id);
        await pExist.update(pg, { transaction });
      }
    }

    // Anexos
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
                idOrdemServico: ordemServico.id,
                nomeArquivo: upload.originalname,
                caminhoS3: upload.key,
                tipoArquivo: upload.mimetype
            }, { transaction })
            )
        );
    }

    await transaction.commit();

    res.status(200).json({
      message: "Ordem de serviço atualizada com sucesso",
      id
    });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

// Função para deletar uma ordem de serviço pelo id
async function deleteOrdemServico(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { idEmpresa, id } = req.params;

    const ordem = await OrdemServico.findOne({
      where: { id, idEmpresa },
      transaction
    });

    if (!ordem) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }

    // Desfazer reservas e recalcular estoque
    const itens = await OrdemProduto.findAll({
      where: { idOrdemServico: id },
      transaction
    });

    for (const item of itens) {
      const produtoDB = await Produto.findByPk(item.idProduto, { transaction });

      if (produtoDB && produtoDB.movimentaEstoque) {
        const novaReserva = produtoDB.estoqueReservado - item.quantidade;
        const novoDisponivel = produtoDB.estoqueDisponivel + item.quantidade;

        await Produto.update(
          {
            estoqueReservado: novaReserva,
            estoqueDisponivel: novoDisponivel
          },
          { where: { id: produtoDB.id }, transaction }
        );

        await Reserva.destroy({
          where: {
            idEmpresa,
            idOrdemServico: id,
            idProduto: item.idProduto
          },
          transaction
        });
      }
    }

    // Deletar Produtos
    await OrdemProduto.destroy({
      where: { idOrdemServico: id },
      transaction
    });

    // Deletar totais
    await OrdemProdutoTotal.destroy({
      where: { idOrdemServico: id },
      transaction
    });

    // Deletar pagamentos
    await Pagamento.destroy({
      where: { idOrdemServico: id },
      transaction
    });

    // Deletar arquivos do S3
    const arquivos = await OrdemServicoArquivo.findAll({
      where: { idOrdemServico: id },
      transaction
    });

    for (const arq of arquivos) {
      try {
        await deleteFromS3(arq.caminhoS3); // função igual à sua uploadToS3, porém para excluir
      } catch (e) {
        console.warn(`Falha ao remover arquivo do S3: ${arq.caminhoS3}`, e);
      }
    }

    await OrdemServicoArquivo.destroy({
      where: { idOrdemServico: id },
      transaction
    });
    
    // Deletar ordem de serviço
    await ordem.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: 'Ordem de serviço deletada com sucesso'
    });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({
      message: 'Erro ao deletar ordem de serviço',
      error: error.message
    });
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