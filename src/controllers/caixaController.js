// const OrdemServico = require('../models/OrdemServico');
const Venda = require('../models/Venda');
const Empresa = require('../models/Empresa');
const Caixa = require('../models/Caixa');
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Pagamento = require('../models/Pagamento');
const EntradaSaida = require('../models/EntradaSaida');
const OrdemServico = require('../models/OrdemServico');
const sequelize = require('../database/connection');
// const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');

// Função para abertura de um caixa
async function postCaixa(req, res) {
    try {
        const caixaData = req.body;
        const { idEmpresa } = req.params;

        // Adiciona idEmpresa aos dados no caixa
        caixaData.idEmpresa = idEmpresa;

        // Cria ao abrir um caixa
        const caixa = await Caixa.create(caixaData);

        res.status(201).json({ message: 'Caixa aberto com sucesso', caixaData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao abrir o caixa', error });
    }
}

// Função adicionar entrada ou saída de dinheiro de um caixa
async function patchCaixa(req, res) {
    try {
        const valoresData = req.body;
        const { idEmpresa } = req.params;
        const { idCaixa } = valoresData; 

        // Adiciona idEmpresa e idCaixa aos dados no caixa
        valoresData.idEmpresa = idEmpresa;
        valoresData.idCaixa = idCaixa;

        // Cria ao abrir um caixa
        const entrada = await EntradaSaida.create(valoresData);

        res.status(201).json({ message: 'Caixa atualizado com sucesso', valoresData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar o caixa', error });
    }
}

// Função para consultar todos os caixas
async function listCaixa(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { idFilial } = req.query;

        const whereConditions = { idEmpresa };
        if (idFilial) whereConditions.idFilial = idFilial;

        const caixas = await Caixa.findAll({
            where: whereConditions,
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome']
                },
                {
                    model: EntradaSaida,
                    as: 'entradaSaida',
                    attributes: ['idUsuario', 'tipo', 'valor', 'dtInclusao'],
                    include: [
                        {
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['id', 'nome']
                        }
                    ],
                    where: idFilial ? { idFilial } : undefined,
                    required: false
                },
                {
                    model: Venda,
                    as: 'vendas',
                    attributes: ['id', 'idCaixa', 'valorTotal', 'createdAt'],
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            attributes: ['id', 'nomeCompleto']
                        },
                        {
                            model: Pagamento,
                            as: 'pagamentos',
                            attributes: ['idCaixa', 'valor', 'tipo', 'parcelas', 'adiantamento']
                        }
                    ],
                    where: idFilial ? { idFilial } : undefined,
                    required: false
                },
                {
                    model: OrdemServico,
                    as: 'ordemServico',
                    attributes: ['id', 'idCaixa', 'valorTotal', 'createdAt'],
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            attributes: ['id', 'nomeCompleto']
                        },
                        {
                            model: Pagamento,
                            as: 'pagamentos',
                            attributes: ['idVenda', 'idCaixa', 'valor', 'tipo', 'parcelas', 'adiantamento', 'createdAt']
                        }
                    ],
                    where: idFilial ? { idFilial } : undefined,
                    required: false
                }
            ],
            order: [['id', 'DESC']]
        });

        if (!caixas || caixas.length === 0) {
            return res.status(404).json({ message: 'Nenhum caixa encontrado' });
        }

        caixas.forEach(caixa => {
            let totalEntradas = 0;
            let totalSaidas = 0;
            let totalPagamentos = 0;
            let totalAdiantamentos = 0;
            let totalPagamentosNormais = 0;
            let pagamentosArray = [];

            // Entradas e saídas
            caixa.entradaSaida?.forEach(item => {
                if (item.tipo === 1) totalEntradas += Number(item.valor);
                else if (item.tipo === 0) totalSaidas += Number(item.valor);
            });

            // PAGAMENTOS DE VENDAS (SOMENTE DO CAIXA CORRETO)
            caixa.vendas?.forEach(venda => {
                venda.pagamentos
                    ?.filter(p => p.idCaixa === caixa.id) // ✅ FILTRO CRÍTICO
                    .forEach(pagamento => {
                        const valor = Number(pagamento.valor) || 0;
                        totalPagamentos += valor;

                        if (pagamento.adiantamento) {
                            totalAdiantamentos += valor;
                        } else {
                            totalPagamentosNormais += valor;
                        }

                        pagamentosArray.push({
                            valor: valor.toFixed(2),
                            tipo: pagamento.tipo,
                            adiantamento: pagamento.adiantamento
                        });
                    });
            });

            // PAGAMENTOS DE OS (SOMENTE DO CAIXA CORRETO)
            caixa.ordemServico?.forEach(os => {
                os.pagamentos
                    ?.filter(p => p.idCaixa === caixa.id) // ✅ FILTRO CRÍTICO
                    .forEach(pagamento => {
                        if (pagamento.idVenda) return;

                        const valor = Number(pagamento.valor) || 0;
                        totalPagamentos += valor;

                        if (pagamento.adiantamento) {
                            totalAdiantamentos += valor;
                        } else {
                            totalPagamentosNormais += valor;
                        }

                        pagamentosArray.push({
                            valor: valor.toFixed(2),
                            tipo: pagamento.tipo,
                            adiantamento: pagamento.adiantamento
                        });
                    });
            });

            // Totais no caixa
            caixa.setDataValue('totalEntradas', totalEntradas.toFixed(2));
            caixa.setDataValue('totalSaidas', totalSaidas.toFixed(2));
            caixa.setDataValue('totalPagamentos', totalPagamentos.toFixed(2));
            caixa.setDataValue('totalAdiantamentos', totalAdiantamentos.toFixed(2));
            caixa.setDataValue('totalPagamentosNormais', totalPagamentosNormais.toFixed(2));
            caixa.setDataValue('pagamentos', pagamentosArray);
        });

        return res.status(200).json(caixas);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar caixas', error });
    }
}

async function caixaAberto(req, res) {
  try {
    const { idEmpresa } = req.params;
    const { idFilial } = req.query;

    // FILTRO BASE DO CAIXA
    const whereConditions = {
      idEmpresa,
      situacao: true
    };

    if (idFilial) whereConditions.idFilial = idFilial;

    // BUSCA DO CAIXA ABERTO
    const caixa = await Caixa.findOne({
      where: whereConditions,
      order: [['id', 'DESC']],
      include: [
        {
          model: Empresa,
          as: 'empresa',
          attributes: ['cnpj', 'nome']
        },

        // ENTRADAS / SAÍDAS (SOMENTE DO CAIXA)
        {
          model: EntradaSaida,
          as: 'entradaSaida',
          attributes: ['idUsuario', 'tipo', 'valor', 'dtInclusao'],
          required: false,
          where: {
            idCaixa: sequelize.col('Caixa.id'),
            ...(idFilial && { idFilial })
          },
          include: [
            {
              model: Usuario,
              as: 'usuario',
              attributes: ['id', 'nome']
            }
          ]
        },

        // VENDAS DO CAIXA
        {
          model: Venda,
          as: 'vendas',
          attributes: ['id', 'idCaixa', 'idFilial', 'valorTotal', 'createdAt'],
          required: false,
          where: {
            idCaixa: sequelize.col('Caixa.id'),
            ...(idFilial && { idFilial })
          },
          include: [
            {
              model: Cliente,
              as: 'cliente',
              attributes: ['id', 'nomeCompleto']
            },
            {
              model: Pagamento,
              as: 'pagamentos',
              attributes: [
                'idVenda',
                'idCaixa',
                'idFilial',
                'valor',
                'tipo',
                'parcelas',
                'adiantamento',
                'createdAt'
              ],
              required: false,
              where: {
                idCaixa: sequelize.col('Caixa.id'),
                ...(idFilial && { idFilial })
              }
            }
          ]
        },

        // ORDENS DE SERVIÇO DO CAIXA
        {
          model: OrdemServico,
          as: 'ordemServico',
          attributes: ['id', 'idCaixa', 'idFilial', 'valorTotal', 'createdAt'],
          required: false,
          where: {
            idCaixa: sequelize.col('Caixa.id'),
            ...(idFilial && { idFilial })
          },
          include: [
            {
              model: Cliente,
              as: 'cliente',
              attributes: ['id', 'nomeCompleto']
            },
            {
              model: Pagamento,
              as: 'pagamentos',
              attributes: [
                'idVenda',
                'idCaixa',
                'idFilial',
                'valor',
                'tipo',
                'parcelas',
                'adiantamento',
                'createdAt'
              ],
              required: false,
              where: {
                idCaixa: sequelize.col('Caixa.id'),
                ...(idFilial && { idFilial })
              }
            }
          ]
        }
      ]
    });

    if (!caixa) {
      return res.status(404).json({ message: 'Caixa não encontrado' });
    }

    // CÁLCULOS DOS TOTAIS
    let totalEntradas = 0;
    let totalSaidas = 0;
    let totalPagamentos = 0;
    let totalAdiantamentos = 0;
    let totalPagamentosVendas = 0;

    const totaisPorTipo = {
      credito: 0,
      debito: 0,
      boleto: 0,
      dinheiro: 0,
      pix: 0,
      crediario: 0,
      duplicata: 0
    };

    const totaisAdiantamentosPorTipo = {
      credito: 0,
      debito: 0,
      boleto: 0,
      dinheiro: 0,
      pix: 0,
      crediario: 0,
      duplicata: 0
    };

    const tiposPagamento = {
      credito: [],
      debito: [],
      boleto: [],
      dinheiro: [],
      pix: [],
      crediario: [],
      duplicata: []
    };

    // Normalizador
    const normalizeString = (str) =>
      str
        ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
        : '';

    // ENTRADAS / SAÍDAS
    caixa.entradaSaida?.forEach(item => {
      const valor = Number(item.valor) || 0;
      if (item.tipo === 1) totalEntradas += valor;
      else if (item.tipo === 0) totalSaidas += valor;
    });

    const pagamentosProcessados = new Set();

    // PAGAMENTOS DE VENDAS
    // caixa.vendas?.forEach(venda => {
    //     venda.pagamentos
    //     ?.filter(p => p.idCaixa === caixa.id)
    //     .forEach(pagamento => {

    //     const pagamentoKey = `venda-${pagamento.id}`;
    //     if (pagamentosProcessados.has(pagamentoKey)) return;
    //     pagamentosProcessados.add(pagamentoKey);

    //     const valor = Number(pagamento.valor) || 0;
    //     const tipo = normalizeString(pagamento.tipo);

    //     if (!tiposPagamento[tipo]) {
    //         tiposPagamento[tipo] = [];
    //         totaisPorTipo[tipo] = 0;
    //         totaisAdiantamentosPorTipo[tipo] = 0;
    //     }

    //     if (pagamento.adiantamento) {
    //         totalAdiantamentos += valor;
    //         totaisAdiantamentosPorTipo[tipo] += valor;
    //     } else {
    //         totalPagamentosVendas += valor;
    //     }

    //     totalPagamentos += valor;
    //     totaisPorTipo[tipo] += valor;

    //     tiposPagamento[tipo].push({
    //         valor: valor.toFixed(2),
    //         adiantamento: pagamento.adiantamento,
    //         venda: pagamento.idVenda,
    //         tipo: pagamento.tipo,
    //         data: pagamento.createdAt
    //     });
    //     });
    // });

     function garantirTipoPagamento(
        tipo,
        tiposPagamento,
        totaisPorTipo,
        totaisAdiantamentosPorTipo
        ) {
        if (!tiposPagamento[tipo]) {
            tiposPagamento[tipo] = [];
            totaisPorTipo[tipo] = 0;
            totaisAdiantamentosPorTipo[tipo] = 0;
        }
    };

    caixa.vendas?.forEach(venda => {
      venda.pagamentos
          ?.filter(p => p.idCaixa === caixa.id)
          .forEach(pagamento => {

          const valor = Number(pagamento.valor) || 0;
          totalPagamentos += valor;

          pagamento.numeroVenda = venda.numeroVenda;
          pagamento.idVenda = venda.id;

          const tipo = normalizeString(pagamento.tipo);
          garantirTipoPagamento(
              tipo,
              tiposPagamento,
              totaisPorTipo,
              totaisAdiantamentosPorTipo
          );

          if (pagamento.adiantamento) {
              totalAdiantamentos += valor;
              totaisAdiantamentosPorTipo[tipo] += valor;
          } else {
              totalPagamentosVendas += valor;
          }

          totaisPorTipo[tipo] += valor;

          tiposPagamento[tipo].push({
              valor: valor.toFixed(2),
              adiantamento: pagamento.adiantamento,
              venda: pagamento.idVenda,
              numeroVenda: pagamento.numeroVenda,
              tipo: pagamento.tipo,
              data: pagamento.createdAt
          });
          });
      });

    // PAGAMENTOS DE OS (SEM DUPLICAR VENDA)
    caixa.ordemServico?.forEach(os => {
        os.pagamentos
            ?.filter(pagamento => pagamento.idCaixa === caixa.id)
            .forEach(pagamento => {
                if (pagamento.idVenda) return;

                const valor = Number(pagamento.valor) || 0;
                totalPagamentos += valor;

                const tipo = normalizeString(pagamento.tipo);

                if (pagamento.adiantamento) {
                    totalAdiantamentos += valor;
                    totaisAdiantamentosPorTipo[tipo] += valor;
                } else {
                    totalPagamentosVendas += valor;
                }

                totaisPorTipo[tipo] += valor;

                tiposPagamento[tipo].push({
                    valor: valor.toFixed(2),
                    adiantamento: pagamento.adiantamento,
                    venda: pagamento.idVenda,
                    tipo: pagamento.tipo,
                    data: pagamento.createdAt
                });
                // if (!tiposPagamento[tipo]) {
                //     tiposPagamento[tipo] = [];
                //     totaisPorTipo[tipo] = 0;
                //     totaisAdiantamentosPorTipo[tipo] = 0;
                // }

                // if (pagamento.adiantamento) {
                //     totalAdiantamentos += valor;
                //     totaisAdiantamentosPorTipo[tipo] += valor;
                // } else {
                //     totalPagamentosVendas += valor;
                // }

                // totalPagamentos += valor;
                // totaisPorTipo[tipo] += valor;

                // tiposPagamento[tipo].push({
                //     valor: valor.toFixed(2),
                //     adiantamento: pagamento.adiantamento,
                //     venda: pagamento.idVenda,
                //     tipo: pagamento.tipo,
                //     data: pagamento.createdAt
                // });
            });
        }
    );

    // RETORNO FINAL
    caixa.setDataValue('totalEntradas', totalEntradas.toFixed(2));
    caixa.setDataValue('totalSaidas', totalSaidas.toFixed(2));
    caixa.setDataValue('totalPagamentos', totalPagamentos.toFixed(2));
    caixa.setDataValue('totalAdiantamentos', totalAdiantamentos.toFixed(2));
    caixa.setDataValue('totalPagamentosVendas', totalPagamentosVendas.toFixed(2));
    caixa.setDataValue('pagamentos', tiposPagamento);
    caixa.setDataValue('totaisPorTipo', totaisPorTipo);
    caixa.setDataValue('totaisAdiantamentosPorTipo', totaisAdiantamentosPorTipo);

    return res.status(200).json(caixa);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar um caixa', error });
  }
}

// Função para buscar um caixa específico 
async function getCaixa(req, res) {
    try {
        const { id, idEmpresa } = req.params;

        const caixa = await Caixa.findOne({
            where: {
                idEmpresa,
                id
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome']
                },
                {
                    model: EntradaSaida,
                    as: 'entradaSaida',
                    attributes: ['idUsuario', 'tipo', 'valor', 'dtInclusao'],
                    include: [
                        {
                            model: Usuario,
                            as: 'usuario',
                            attributes: ['id', 'nome']
                        }
                    ]
                },
                {
                    model: Venda,
                    as: 'vendas',
                    attributes: ['id', 'numeroVenda', 'idCaixa', 'valorTotal', 'createdAt'],
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            attributes: ['id', 'nomeCompleto']
                        },
                        {
                            model: Pagamento,
                            as: 'pagamentos',
                            attributes: ['idVenda', 'idCaixa', 'valor', 'tipo', 'parcelas', 'adiantamento', 'createdAt']
                        }
                    ]
                },
                {
                    model: OrdemServico,
                    as: 'ordemServico',
                    attributes: ['id', 'idCaixa', 'valorTotal', 'createdAt'],
                    include: [
                        {
                            model: Cliente,
                            as: 'cliente',
                            attributes: ['id', 'nomeCompleto']
                        },
                        {
                            model: Pagamento,
                            as: 'pagamentos',
                            attributes: ['idVenda', 'idCaixa', 'valor', 'tipo', 'parcelas', 'adiantamento', 'createdAt']
                        }
                    ]
                }
            ],
            order: [['id', 'DESC']]
        });

        if (!caixa) {
            return res.status(404).json({ message: 'Caixa não encontrado' });
        }

        // Totais
        let totalEntradas = 0;
        let totalSaidas = 0;
        let totalPagamentos = 0;
        let totalAdiantamentos = 0;
        let totalPagamentosVendas = 0;

        const totaisPorTipo = { credito: 0, debito: 0, boleto: 0, dinheiro: 0, pix: 0, crediario: 0, duplicata: 0 };
        const totaisAdiantamentosPorTipo = { credito: 0, debito: 0, boleto: 0, dinheiro: 0, pix: 0, crediario: 0, duplicata: 0 };
        const tiposPagamento = { credito: [], debito: [], boleto: [], dinheiro: [], pix: [], crediario: [], duplicata: [] };

        // Entradas / Saídas
        caixa.entradaSaida?.forEach(item => {
            if (item.tipo === 1) totalEntradas += Number(item.valor);
            else if (item.tipo === 0) totalSaidas += Number(item.valor);
        });

        const normalizeString = str =>
            str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        function garantirTipoPagamento(
            tipo,
            tiposPagamento,
            totaisPorTipo,
            totaisAdiantamentosPorTipo
            ) {
            if (!tiposPagamento[tipo]) {
                tiposPagamento[tipo] = [];
                totaisPorTipo[tipo] = 0;
                totaisAdiantamentosPorTipo[tipo] = 0;
            }
        };

        caixa.vendas?.forEach(venda => {
            venda.pagamentos
                ?.filter(p => p.idCaixa === caixa.id)
                .forEach(pagamento => {
                const valor = Number(pagamento.valor) || 0;
                totalPagamentos += valor;

                pagamento.numeroVenda = venda.numeroVenda;
                pagamento.idVenda = venda.id;

                const tipo = normalizeString(pagamento.tipo);
                garantirTipoPagamento(
                    tipo,
                    tiposPagamento,
                    totaisPorTipo,
                    totaisAdiantamentosPorTipo
                );

                if (pagamento.adiantamento) {
                    totalAdiantamentos += valor;
                    totaisAdiantamentosPorTipo[tipo] += valor;
                } else {
                    totalPagamentosVendas += valor;
                }

                totaisPorTipo[tipo] += valor;

                tiposPagamento[tipo].push({
                    valor: valor.toFixed(2),
                    adiantamento: pagamento.adiantamento,
                    venda: pagamento.idVenda,
                    numeroVenda: pagamento.numeroVenda,
                    tipo: pagamento.tipo,
                    data: pagamento.createdAt
                });
                });
            }
        );

        caixa.ordemServico?.forEach(os => {
            os.pagamentos
                ?.filter(p => p.idCaixa === caixa.id)
                .forEach(pagamento => {
                if (pagamento.idVenda) return;

                const valor = Number(pagamento.valor) || 0;
                totalPagamentos += valor;

                const tipo = normalizeString(pagamento.tipo);
                garantirTipoPagamento(
                    tipo,
                    tiposPagamento,
                    totaisPorTipo,
                    totaisAdiantamentosPorTipo
                );

                if (pagamento.adiantamento) {
                    totalAdiantamentos += valor;
                    totaisAdiantamentosPorTipo[tipo] += valor;
                } else {
                    totalPagamentosVendas += valor;
                }

                totaisPorTipo[tipo] += valor;

                tiposPagamento[tipo].push({
                    valor: valor.toFixed(2),
                    adiantamento: pagamento.adiantamento,
                    venda: pagamento.idVenda,
                    tipo: pagamento.tipo,
                    data: pagamento.createdAt
                });
                });
            }
        );

        // Setar totais
        caixa.setDataValue('totalEntradas', totalEntradas.toFixed(2));
        caixa.setDataValue('totalSaidas', totalSaidas.toFixed(2));
        caixa.setDataValue('totalPagamentos', totalPagamentos.toFixed(2));
        caixa.setDataValue('totalAdiantamentos', totalAdiantamentos.toFixed(2));
        caixa.setDataValue('totalPagamentosVendas', totalPagamentosVendas.toFixed(2));
        caixa.setDataValue('pagamentos', tiposPagamento);
        caixa.setDataValue('totaisPorTipo', totaisPorTipo);
        caixa.setDataValue('totaisAdiantamentosPorTipo', totaisAdiantamentosPorTipo);

        return res.status(200).json(caixa);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao buscar um caixa', error });
    }
}

// Função para atualizar um caixa pelo Id
async function putCaixa(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const caixaData = req.body; 

        // Atualiza o caixa no banco de dados
        const [updated] = await Caixa.update(caixaData, {
            where: { 
                id: id,
                idEmpresa: idEmpresa
            }
        });

        if (updated) {
            // Busca o caixa atualizada para retornar na resposta
            const caixa = await Caixa.findOne({ where: { id: id, idEmpresa: idEmpresa } });
            res.status(200).json({ message: 'Caixa atualizadao com sucesso', caixa });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Caixa não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar o caixa', error });
    }
}

module.exports = {
    postCaixa,
    patchCaixa,
    listCaixa,
    getCaixa,
    caixaAberto,
    putCaixa
};