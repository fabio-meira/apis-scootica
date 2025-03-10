// const OrdemServico = require('../models/OrdemServico');
const Venda = require('../models/Venda');
const Empresa = require('../models/Empresa');
const Caixa = require('../models/Caixa');
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Pagamento = require('../models/Pagamento');
const EntradaSaida = require('../models/EntradaSaida');
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

// Função para consultar todas os caixas
async function listCaixa(req, res) {
    try {
        const { idEmpresa } = req.params;

        const caixas = await Caixa.findAll({
            where: {
                idEmpresa: idEmpresa
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome']
                },
                // {
                //     model: Usuario,
                //     as: 'usuario',
                //     attributes: ['login', 'nome', 'email']
                // },
                {
                    model: EntradaSaida,
                    as: 'entradaSaida',
                    attributes: ['idUsuario', 'tipo', 'valor']
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
                            attributes: ['valor', 'tipo', 'parcelas', 'adiantamento']
                        }
                    ]
                }
            ],
            order: [
                ['id', 'DESC']
            ]
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

            caixa.entradaSaida.forEach(item => {
                if (item.tipo === 1) {
                    totalEntradas += parseFloat(item.valor);
                } else if (item.tipo === 0) {
                    totalSaidas += parseFloat(item.valor);
                }
            });

            caixa.vendas.forEach(venda => {
                venda.pagamentos.forEach(pagamento => {
                    totalPagamentos += parseFloat(pagamento.valor);
                    if (pagamento.adiantamento) {
                        totalAdiantamentos += parseFloat(pagamento.valor);
                    } else {
                        totalPagamentosNormais += parseFloat(pagamento.valor);
                    }
                    pagamentosArray.push({
                        valor: parseFloat(pagamento.valor).toFixed(2),
                        tipo: pagamento.tipo,
                        adiantamento: pagamento.adiantamento
                    });
                });
            });

            // Adicionar os totais ao objeto caixa
            caixa.setDataValue('totalEntradas', totalEntradas.toFixed(2));
            caixa.setDataValue('totalSaidas', totalSaidas.toFixed(2));
            caixa.setDataValue('totalPagamentos', totalPagamentos.toFixed(2));
            caixa.setDataValue('totalAdiantamentos', totalAdiantamentos.toFixed(2));
            caixa.setDataValue('totalPagamentosNormais', totalPagamentosNormais.toFixed(2));
            caixa.setDataValue('pagamentos', pagamentosArray);
        });

        res.status(200).json(caixas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar caixas', error });
    }
}

// Função para buscar por um caixa aberto
// async function caixaAberto(req, res) {
//     try {
//         const { id } = req.params; 
//         const { idEmpresa } = req.params;

//         const caixa = await Caixa.findOne({
//             where: {
//                 idEmpresa: idEmpresa,
//                 situacao: true
//             },
//             include: [
//                 {
//                     model: Empresa,
//                     as: 'empresa',
//                     attributes: ['cnpj', 'nome']
//                 },
//                 {
//                     model: EntradaSaida,
//                     as: 'entradaSaida',
//                     attributes: ['idUsuario', 'tipo', 'valor', 'dtInclusao']
//                 },
//                 {
//                     model: Venda,
//                     as: 'vendas',
//                     attributes: ['id', 'idCaixa', 'valorTotal', 'createdAt'],
//                     include: [
//                         {
//                             model: Cliente,
//                             as: 'cliente',
//                             attributes: ['id', 'nomeCompleto']
//                         },
//                         {
//                             model: Pagamento,
//                             as: 'pagamentos',
//                             attributes: ['idVenda', 'valor', 'tipo', 'parcelas', 'adiantamento', 'createdAt']
//                         }
//                     ]
//                 }
//             ],
//             order: [
//                 ['id', 'DESC']
//             ]
//         });

//         if (!caixa) {
//             return res.status(404).json({ message: 'Caixa não encontrado' });
//         }

//         // Calcular o total de entradas e saídas
//         let totalEntradas = 0;
//         let totalSaidas = 0;
//         let totalPagamentos = 0;
//         let totalAdiantamentos = 0;
//         let totalPagamentosVendas = 0;
//         let pagamentosArray = [];

//         // Inicializar totais por tipo de pagamento
//         const totaisPorTipo = {
//             'credito': 0,
//             'debito': 0,
//             'boleto': 0,
//             'dinheiro': 0,
//             'pix': 0,
//             'crediario': 0,
//             'duplicata': 0
//         };

//         // Agrupamento por tipo de pagamento
//         const tiposPagamento = {
//             'credito': [],
//             'debito': [],
//             'boleto': [],
//             'dinheiro': [],
//             'pix': [],
//             'crediario': [],
//             'duplicata': []
//         };

//         caixa.entradaSaida.forEach(item => {
//             if (item.tipo === 1) {
//                 totalEntradas += parseFloat(item.valor);
//             } else if (item.tipo === 0) {
//                 totalSaidas += parseFloat(item.valor);
//             }
//         });

//         // Função para normalizar strings e remover acentuação
//         const normalizeString = (str) => {
//             return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
//         };

//         caixa.vendas.forEach(venda => {
//             venda.pagamentos.forEach(pagamento => {
//                 totalPagamentos += parseFloat(pagamento.valor);
//                 if (pagamento.adiantamento) {
//                     totalAdiantamentos += parseFloat(pagamento.valor);
//                 } else {
//                     totalPagamentosVendas += parseFloat(pagamento.valor);
//                 }

//                 // Agrupando os pagamentos pelo tipo
//                 const tipo = normalizeString(pagamento.tipo); // Normaliza o tipo
//                 if (tiposPagamento[tipo]) {
//                     tiposPagamento[tipo].push({
//                         valor: parseFloat(pagamento.valor).toFixed(2),
//                         adiantamento: pagamento.adiantamento,
//                         venda: pagamento.idVenda,
//                         tipo: pagamento.tipo,
//                         data: pagamento.createdAt
//                     });
//                     // Somando ao total por tipo
//                     totaisPorTipo[tipo] += parseFloat(pagamento.valor);
//                 }
//             });
//         });

//         // Adiciona os totais ao objeto caixa
//         caixa.setDataValue('totalEntradas', totalEntradas.toFixed(2));
//         caixa.setDataValue('totalSaidas', totalSaidas.toFixed(2));
//         caixa.setDataValue('totalPagamentos', totalPagamentos.toFixed(2));
//         caixa.setDataValue('totalAdiantamentos', totalAdiantamentos.toFixed(2));
//         caixa.setDataValue('totalPagamentosVendas', totalPagamentosVendas.toFixed(2));
//         caixa.setDataValue('pagamentos', tiposPagamento);
//         caixa.setDataValue('totaisPorTipo', totaisPorTipo); 

//         res.status(200).json(caixa);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Erro ao buscar um caixa', error });
//     }
// }

async function caixaAberto(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;

        const caixa = await Caixa.findOne({
            where: {
                idEmpresa: idEmpresa,
                situacao: true
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
                            attributes: ['idVenda', 'valor', 'tipo', 'parcelas', 'adiantamento', 'createdAt']
                        }
                    ]
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!caixa) {
            return res.status(404).json({ message: 'Caixa não encontrado' });
        }

        // Calcular o total de entradas e saídas
        let totalEntradas = 0;
        let totalSaidas = 0;
        let totalPagamentos = 0;
        let totalAdiantamentos = 0;
        let totalPagamentosVendas = 0;

        // Inicializar totais por tipo de pagamento
        const totaisPorTipo = {
            'credito': 0,
            'debito': 0,
            'boleto': 0,
            'dinheiro': 0,
            'pix': 0,
            'crediario': 0,
            'duplicata': 0
        };

        // Agrupamento por tipo de pagamento
        const tiposPagamento = {
            'credito': [],
            'debito': [],
            'boleto': [],
            'dinheiro': [],
            'pix': [],
            'crediario': [],
            'duplicata': []
        };

        // Inicializar totais de adiantamentos por tipo
        const totaisAdiantamentosPorTipo = {
            'credito': 0,
            'debito': 0,
            'boleto': 0,
            'dinheiro': 0,
            'pix': 0,
            'crediario': 0,
            'duplicata': 0
        };

        caixa.entradaSaida.forEach(item => {
            if (item.tipo === 1) {
                totalEntradas += parseFloat(item.valor);
            } else if (item.tipo === 0) {
                totalSaidas += parseFloat(item.valor);
            }
        });

        // Função para normalizar strings e remover acentuação
        const normalizeString = (str) => {
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        };

        caixa.vendas.forEach(venda => {
            venda.pagamentos.forEach(pagamento => {
                totalPagamentos += parseFloat(pagamento.valor);
                if (pagamento.adiantamento) {
                    totalAdiantamentos += parseFloat(pagamento.valor);
                    const tipo = normalizeString(pagamento.tipo);
                    // Somando ao total por tipo de adiantamento
                    if (totaisAdiantamentosPorTipo[tipo] !== undefined) {
                        totaisAdiantamentosPorTipo[tipo] += parseFloat(pagamento.valor);
                    }
                } else {
                    totalPagamentosVendas += parseFloat(pagamento.valor);
                }

                // Agrupando os pagamentos pelo tipo
                const tipo = normalizeString(pagamento.tipo); // Normaliza o tipo
                if (tiposPagamento[tipo]) {
                    tiposPagamento[tipo].push({
                        valor: parseFloat(pagamento.valor).toFixed(2),
                        adiantamento: pagamento.adiantamento,
                        venda: pagamento.idVenda,
                        tipo: pagamento.tipo,
                        data: pagamento.createdAt
                    });
                    // Somando ao total por tipo
                    totaisPorTipo[tipo] += parseFloat(pagamento.valor);
                }
            });
        });

        // Adiciona os totais ao objeto caixa
        caixa.setDataValue('totalEntradas', totalEntradas.toFixed(2));
        caixa.setDataValue('totalSaidas', totalSaidas.toFixed(2));
        caixa.setDataValue('totalPagamentos', totalPagamentos.toFixed(2));
        caixa.setDataValue('totalAdiantamentos', totalAdiantamentos.toFixed(2));
        caixa.setDataValue('totalPagamentosVendas', totalPagamentosVendas.toFixed(2));
        caixa.setDataValue('pagamentos', tiposPagamento);
        caixa.setDataValue('totaisPorTipo', totaisPorTipo); 
        caixa.setDataValue('totaisAdiantamentosPorTipo', totaisAdiantamentosPorTipo); // Adiciona totais de adiantamentos

        res.status(200).json(caixa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar um caixa', error });
    }
}


// Função para buscar por um caixa específico
async function getCaixa(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;

        const caixa = await Caixa.findOne({
            where: {
                idEmpresa: idEmpresa,
                id: id
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
                            attributes: ['idVenda', 'valor', 'tipo', 'parcelas', 'adiantamento', 'createdAt']
                        }
                    ]
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!caixa) {
            return res.status(404).json({ message: 'Caixa não encontrado' });
        }

        // Calcular o total de entradas e saídas
        let totalEntradas = 0;
        let totalSaidas = 0;
        let totalPagamentos = 0;
        let totalAdiantamentos = 0;
        let totalPagamentosVendas = 0;
        let pagamentosArray = [];

        // Inicializar totais por tipo de pagamento
        const totaisPorTipo = {
            'credito': 0,
            'debito': 0,
            'boleto': 0,
            'dinheiro': 0,
            'pix': 0,
            'crediario': 0,
            'duplicata': 0
        };

        // Agrupamento por tipo de pagamento
        const tiposPagamento = {
            'credito': [],
            'debito': [],
            'boleto': [],
            'dinheiro': [],
            'pix': [],
            'crediario': [],
            'duplicata': []
        };

        caixa.entradaSaida.forEach(item => {
            if (item.tipo === 1) {
                totalEntradas += parseFloat(item.valor);
            } else if (item.tipo === 0) {
                totalSaidas += parseFloat(item.valor);
            }
        });

        // Função para normalizar strings e remover acentuação
        const normalizeString = (str) => {
            return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        };

        caixa.vendas.forEach(venda => {
            venda.pagamentos.forEach(pagamento => {
                totalPagamentos += parseFloat(pagamento.valor);
                if (pagamento.adiantamento) {
                    totalAdiantamentos += parseFloat(pagamento.valor);
                } else {
                    totalPagamentosVendas += parseFloat(pagamento.valor);
                }

                // Agrupando os pagamentos pelo tipo
                const tipo = normalizeString(pagamento.tipo); // Normaliza o tipo
                if (tiposPagamento[tipo]) {
                    tiposPagamento[tipo].push({
                        valor: parseFloat(pagamento.valor).toFixed(2),
                        adiantamento: pagamento.adiantamento,
                        venda: pagamento.idVenda,
                        tipo: pagamento.tipo,
                        data: pagamento.createdAt
                    });
                    // Somando ao total por tipo
                    totaisPorTipo[tipo] += parseFloat(pagamento.valor);
                }
            });
        });

        // Adiciona os totais ao objeto caixa
        caixa.setDataValue('totalEntradas', totalEntradas.toFixed(2));
        caixa.setDataValue('totalSaidas', totalSaidas.toFixed(2));
        caixa.setDataValue('totalPagamentos', totalPagamentos.toFixed(2));
        caixa.setDataValue('totalAdiantamentos', totalAdiantamentos.toFixed(2));
        caixa.setDataValue('totalPagamentosVendas', totalPagamentosVendas.toFixed(2));
        caixa.setDataValue('pagamentos', tiposPagamento);
        caixa.setDataValue('totaisPorTipo', totaisPorTipo); 

        res.status(200).json(caixa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar um caixa', error });
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