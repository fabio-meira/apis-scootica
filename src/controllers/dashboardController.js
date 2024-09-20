const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Venda = require('../models/Venda');
const Pagamento = require('../models/Pagamento');
const Cliente = require('../models/Cliente');
const Receita = require('../models/Receita');
const Medico = require('../models/Medico');
const OrdemServico = require('../models/OrdemServico');
const Orcamento = require('../models/Orcamento');
const moment = require('moment');
const { Op, fn, col, literal } = require('sequelize');

async function getVendaSemanal(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const startOfWeek = new Date();
        // Obtém o início da semana (domingo)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); 
        startOfWeek.setHours(0, 0, 0, 0);
  
        const endOfWeek = new Date(startOfWeek);
        // Obtém o fim da semana (sábado)
        endOfWeek.setDate(startOfWeek.getDate() + 6); 
        endOfWeek.setHours(23, 59, 59, 999);
  
        // Consulta os orçamentos gerados durante a semana
        const orcamentos = await Orcamento.findAll({
            where: {
                idEmpresa: idEmpresa,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
            },
            attributes: [
                [fn('DATE', col('Orcamento.createdAt')), 'date'],
                [literal('DAYNAME(`Orcamento`.`createdAt`)'), 'dayOfWeek'],
                [fn('COUNT', col('Orcamento.id')), 'QtdeOrcamentos'],
                [fn('SUM', col('totais.total')), 'totalOrcamento'],
            ],
            group: ['date', 'dayOfWeek'],
            include: [
                {
                    model: OrdemProdutoTotal,
                    as: 'totais',
                    attributes: [],
                    required: false
                }
            ],
            raw: true
        });
  
        // Consulta as ordens de serviço geradas durante a semana e calcula o total do valor
        const ordensServico = await OrdemServico.findAll({
            where: {
                idEmpresa: idEmpresa,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
            },
            attributes: [
                [fn('DATE', col('OrdemServico.createdAt')), 'date'],
                [literal('DAYNAME(`OrdemServico`.`createdAt`)'), 'dayOfWeek'],
                [fn('SUM', literal('DISTINCT `valorTotal`')), 'totalValorServicos'],
                [fn('COUNT', literal('DISTINCT CASE WHEN `pagamentos`.`adiantamento` = 1 THEN `OrdemServico`.`id` END')), 'QtdeOS'],
                [fn('SUM', literal('CASE WHEN `pagamentos`.`adiantamento` = 1 THEN `pagamentos`.`valor` ELSE 0 END')), 'totalAdiantamento']

            ],
            group: ['date', 'dayOfWeek'],
            include: [
                {
                    model: Pagamento,
                    as: 'pagamentos',
                    attributes: [],
                    required: false
                }
            ],
            raw: true
        });

        // Consulta as vendas geradas durante a semana e calcula o total do valor
        const vendas = await Venda.findAll({
            where: {
                idEmpresa: idEmpresa,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
            },
            attributes: [
                [fn('DATE', col('Venda.createdAt')), 'date'],
                [literal('DAYNAME(`Venda`.`createdAt`)'), 'dayOfWeek'],
                [fn('SUM', literal('DISTINCT `valorTotal`')), 'totalValorVendas'],
                [fn('COUNT', literal('DISTINCT CASE WHEN `pagamentos`.`adiantamento` = 1 THEN `Venda`.`id` END')), 'QtdeVenda'],
                // [fn('COUNT', col('Venda.id')), 'QtdeVenda'],
                [fn('SUM', literal('CASE WHEN `pagamentos`.`adiantamento` = 0 THEN `pagamentos`.`valor` ELSE 0 END')), 'totalValorPago']

            ],
            group: ['date', 'dayOfWeek'],
            include: [
                {
                    model: Pagamento,
                    as: 'pagamentos',
                    attributes: [],
                    required: false
                }
            ],
            raw: true
        });

        // Ordenar os dados por data
        const sortedOrcamentos = orcamentos.sort((a, b) => new Date(a.date) - new Date(b.date));
        const sortedOrdensServico = ordensServico.sort((a, b) => new Date(a.date) - new Date(b.date));
        const sortedVendas = vendas.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Função para calcular o percentual de variação
        const calcularPercentual = (hoje, ontem) => {
            if (ontem === 0) return hoje > 0 ? 100 : 0;
            return ((hoje - ontem) / ontem) * 100;
        };

        // Adicionar a variação percentual nos dados
        const adicionarPercentuais = (dados) => {
            return dados.map((item, index, array) => {
                const valorHoje = parseFloat(item.totalOrcamento || item.totalAdiantamento || item.totalValorVendas) || 0;
                const valorOntem = index > 0 ? parseFloat(array[index - 1].totalOrcamento || array[index - 1].totalAdiantamento || array[index - 1].totalValorVendas) || 0 : 0;
                const percentual = calcularPercentual(valorHoje, valorOntem);
                return { ...item, percentual: percentual.toFixed(2) };
            });
        };

        const orcamentosComPercentuais = adicionarPercentuais(sortedOrcamentos);
        const ordensServicoComPercentuais = adicionarPercentuais(sortedOrdensServico);
        const vendasComPercentuais = adicionarPercentuais(sortedVendas);

        // Montar a resposta com os dados obtidos e percentuais calculados
        res.status(200).json({
            orcamentos: orcamentosComPercentuais,
            ordensServico: ordensServicoComPercentuais,
            vendas: vendasComPercentuais
        });
    } catch (error) {
        console.error('Erro ao consultar dados da semana:', error);
        res.status(500).json({ error: 'Erro ao consultar dados da semana' });
    }
}

async function listMensagens(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { search, month } = req.query;

        // Calcular o intervalo de datas para o mês corrente ou o mês especificado
        const currentYear = moment().year();
        // Mês é 1-based em moment
        const monthToCheck = month ? parseInt(month, 10) : moment().month() + 1; 
        const startDate = moment(`${currentYear}-${monthToCheck}-01`).startOf('month');
        const endDate = moment(startDate).endOf('month');
        
        // Calcule a data de um ano atrás
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoDate = oneYearAgo.toISOString().split('T')[0];

        // Data corrente
        const today = moment().format('YYYY-MM-DD');

        // Consulta de clientes com aniversário no mês
        const clientes = await Cliente.findAll({
            where: {
                idEmpresa,
                [Op.and]: [
                    literal(`MONTH(dtNascimento) = ${monthToCheck}`),
                    literal(`DAY(dtNascimento) BETWEEN ${startDate.format('DD')} AND ${endDate.format('DD')}`)
                ],
            },
            attributes: ['nomeCompleto', 'dtNascimento', 'celular', 'email'],
            // Ordenar pelo mês e dia do aniversário
            order: [
                [fn('DATE_FORMAT', col('dtNascimento'), '%m-%d'), 'ASC'] 
            ]
        });

        // Consulta de receitas no mês
        const receitas = await Receita.findAll({
            where: {
                idEmpresa,
                [Op.and]: [
                    literal(`MONTH(dtReceita) = ${monthToCheck}`),
                    literal(`DAY(dtReceita) BETWEEN ${startDate.format('DD')} AND ${endDate.format('DD')}`)
                ],
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
            // Ordenar pelo mês e dia da receita
            order: [
                [fn('DATE_FORMAT', col('dtReceita'), '%m-%d'), 'ASC'] 
            ]
        });

        // Consulta de aniversariantes do dia corrente
        const aniversariantesHoje = await Cliente.findAll({
            where: {
                idEmpresa,
                [Op.and]: [
                    literal(`MONTH(dtNascimento) = ${moment().month() + 1}`),
                    literal(`DAY(dtNascimento) = ${moment().date()}`)
                ],
            },
            attributes: ['nomeCompleto', 'dtNascimento', 'celular', 'email'],
        });

        // Consulta de receitas vencidas no dia corrente
        const receitasHoje = await Receita.findAll({
            where: {
                idEmpresa,
                [Op.and]: [
                    literal(`DATE(dtReceita) = '${oneYearAgoDate}'`)
                ],
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
        });

        // Consolidar resultados
        const result = {
            aniversariantes: {
                quantidade: clientes.length,
                clientes: clientes.map(cliente => ({
                    nomeCompleto: cliente.nomeCompleto,
                    dtNascimento: cliente.dtNascimento,
                    celular: cliente.celular,
                    email: cliente.email
                }))
            },
            receitas: {
                quantidade: receitas.length,
                receitas: receitas.map(receita => ({
                    dtReceita: receita.dtReceita,
                    paciente: {
                        nomeCompleto: receita.paciente.nomeCompleto,
                        cpf: receita.paciente.cpf,
                        dtNascimento: receita.paciente.dtNascimento,
                        celular: receita.paciente.celular,
                        email: receita.paciente.email
                    },
                    medico: {
                        nomeCompleto: receita.medico.nomeCompleto,
                        cpf: receita.medico.cpf,
                        registro: receita.medico.registro,
                        celular: receita.medico.celular,
                        email: receita.medico.email
                    }
                }))
            },
            aniversariantesHoje: {
                quantidade: aniversariantesHoje.length,
                clientes: aniversariantesHoje.map(cliente => ({
                    nomeCompleto: cliente.nomeCompleto,
                    dtNascimento: cliente.dtNascimento,
                    celular: cliente.celular,
                    email: cliente.email
                }))
            },
            receitasHoje: {
                quantidade: receitasHoje.length,
                receitas: receitasHoje.map(receita => ({
                    dtReceita: receita.dtReceita,
                    paciente: {
                        nomeCompleto: receita.paciente.nomeCompleto,
                        cpf: receita.paciente.cpf,
                        dtNascimento: receita.paciente.dtNascimento,
                        celular: receita.paciente.celular,
                        email: receita.paciente.email
                    },
                    medico: {
                        nomeCompleto: receita.medico.nomeCompleto,
                        cpf: receita.medico.cpf,
                        registro: receita.medico.registro,
                        celular: receita.medico.celular,
                        email: receita.medico.email
                    }
                }))
            }
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar aniversariantes e receitas', error });
    }
}

module.exports = {
    getVendaSemanal,
    listMensagens
};