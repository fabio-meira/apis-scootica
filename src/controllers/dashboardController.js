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
const { format, utcToZonedTime } = require('date-fns-tz');

async function getVendaSemanal(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { idFilial } = req.query;

        const startOfWeek = new Date();
        // Obtém o início da semana (domingo)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); 
        startOfWeek.setHours(0, 0, 0, 0);
  
        const endOfWeek = new Date(startOfWeek);
        // Obtém o fim da semana (sábado)
        endOfWeek.setDate(startOfWeek.getDate() + 6); 
        endOfWeek.setHours(23, 59, 59, 999);

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
        }
  
        // Consulta os orçamentos gerados durante a semana
        const orcamentos = await Orcamento.findAll({
            where: {
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
            },
            attributes: [
                [fn('DATE', col('Orcamento.createdAt')), 'date'],
                [literal('DAYNAME(`Orcamento`.`createdAt`)'), 'dayOfWeek'],
                [col('Orcamento.origemVenda'), 'origem'],
                [fn('COUNT', col('Orcamento.id')), 'QtdeOrcamentos'],
                [fn('SUM', col('totais.total')), 'totalOrcamento'],
            ],
            group: ['date', 'dayOfWeek', 'origem'],
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
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
            },
            attributes: [
                [fn('DATE', col('OrdemServico.createdAt')), 'date'],
                [literal('DAYNAME(`OrdemServico`.`createdAt`)'), 'dayOfWeek'],
                [col('OrdemServico.origemVenda'), 'origem'],
                [fn('SUM', literal('DISTINCT `valorTotal`')), 'totalValorServicos'],
                [fn('COUNT', literal('DISTINCT CASE WHEN `pagamentos`.`adiantamento` = 1 THEN `OrdemServico`.`id` END')), 'QtdeOS'],
                [fn('SUM', literal('CASE WHEN `pagamentos`.`adiantamento` = 1 THEN `pagamentos`.`valor` ELSE 0 END')), 'totalAdiantamento']

            ],
            group: ['date', 'dayOfWeek', 'origem'],
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
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfWeek, endOfWeek],
                },
            },
            attributes: [
                [fn('DATE', col('Venda.createdAt')), 'date'],
                [literal('DAYNAME(`Venda`.`createdAt`)'), 'dayOfWeek'],
                [col('Venda.origemVenda'), 'origem'],
                [fn('SUM', literal('DISTINCT `valorTotal`')), 'totalValorVendas'],
                [fn('COUNT', literal('DISTINCT CASE WHEN `pagamentos`.`adiantamento` = 0 THEN `Venda`.`id` END')), 'QtdeVenda'],
                // [fn('COUNT', col('Venda.id')), 'QtdeVenda'],
                [fn('SUM', literal('CASE WHEN `pagamentos`.`adiantamento` = 0 THEN `pagamentos`.`valor` ELSE 0 END')), 'totalValorPago']

            ],
            group: ['date', 'dayOfWeek', 'origem'],
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

async function getConsolidadoMensal(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { idFilial } = req.query;
        
        const year = new Date().getFullYear();
        const month = new Date().getMonth(); // Mês atual (0 = janeiro, 1 = fevereiro, etc.)
        
        const startOfMonth = new Date(year, month, 1); // Primeiro dia do mês
        const endOfMonth = new Date(year, month + 1, 0); // Último dia do mês

        // Inicializar o array para consolidar dados diários
        const consolidado = [];

        // Preencher o array com os dias do mês
        for (let day = 1; day <= endOfMonth.getDate(); day++) {
            consolidado.push({
                date: format(new Date(year, month, day), 'yyyy-MM-dd'), // Apenas a data
                orcamentos: { total: 0, quantidade: 0 },
                ordensServico: { total: 0, quantidade: 0 },
                vendas: { total: 0, quantidade: 0 }
            });
        }

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
        }

        // Coletar os dados diários de orçamentos
        const orcamentos = await Orcamento.findAll({
            where: {
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth],
                },
            },
            // attributes: [
            //     [fn('DATE', col('Orcamento.createdAt')), 'date'],
            //     [fn('SUM', col('totais.total')), 'totalOrcamento'],
            //     [fn('COUNT', col('Orcamento.id')), 'QtdeOrcamentos'],
            // ],
            attributes: [
                [fn('DATE_FORMAT', col('Orcamento.createdAt'), '%Y-%m-%d'), 'date'],
                [fn('SUM', col('totais.total')), 'totalOrcamento'],
                [fn('COUNT', col('Orcamento.id')), 'QtdeOrcamentos'],
            ],
            include: [
                {
                    model: OrdemProdutoTotal,
                    as: 'totais',
                    attributes: [],
                    required: false
                }
            ],
            group: ['date'],
            raw: true
        });

        // Coletar os dados diários de ordens de serviço
        const ordensServico = await OrdemServico.findAll({
            where: {
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth],
                },
            },
            // attributes: [
            //     [fn('DATE', col('OrdemServico.createdAt')), 'date'],
            //     [fn('SUM', literal('DISTINCT valorTotal')), 'totalValorServicos'],
            //     [fn('COUNT', col('OrdemServico.id')), 'QtdeOS'],
            // ],
            attributes: [
                [fn('DATE_FORMAT', col('OrdemServico.createdAt'), '%Y-%m-%d'), 'date'],
                [fn('SUM', literal('DISTINCT valorTotal')), 'totalValorServicos'],
                [fn('COUNT', col('OrdemServico.id')), 'QtdeOS'],
            ],
            include: [
                {
                    model: Pagamento,
                    as: 'pagamentos',
                    attributes: [],
                    required: false
                }
            ],
            group: ['date'],
            raw: true
        });

        // Coletar os dados diários de vendas
        const vendas = await Venda.findAll({
            where: {
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth],
                },
            },
            // attributes: [
            //     [fn('DATE', col('Venda.createdAt')), 'date'],
            //     [fn('SUM', literal('DISTINCT valorTotal')), 'totalValorVendas'],
            //     [fn('COUNT', col('Venda.id')), 'QtdeVenda'],
            // ],
            attributes: [
                [fn('DATE_FORMAT', col('Venda.createdAt'), '%Y-%m-%d'), 'date'],
                [fn('SUM', literal('DISTINCT valorTotal')), 'totalValorVendas'],
                [fn('COUNT', col('Venda.id')), 'QtdeVenda'],
            ],
            include: [
                {
                    model: Pagamento,
                    as: 'pagamentos',
                    attributes: [],
                    required: false
                }
            ],
            group: ['date'],
            raw: true
        });

        // Consolidar os dados nos dias correspondentes
        const mapConsolidado = (data, tipo) => {
            data.forEach(item => {
                const dateIndex = consolidado.findIndex(d => d.date === item.date);
                if (dateIndex !== -1) {
                    if (tipo === 'orcamento') {
                        consolidado[dateIndex].orcamentos.total += parseFloat(item.totalOrcamento || 0);
                        consolidado[dateIndex].orcamentos.quantidade += parseInt(item.QtdeOrcamentos || 0);
                    } else if (tipo === 'ordemServico') {
                        consolidado[dateIndex].ordensServico.total += parseFloat(item.totalValorServicos || 0);
                        consolidado[dateIndex].ordensServico.quantidade += parseInt(item.QtdeOS || 0);
                    } else if (tipo === 'venda') {
                        consolidado[dateIndex].vendas.total += parseFloat(item.totalValorVendas || 0);
                        consolidado[dateIndex].vendas.quantidade += parseInt(item.QtdeVenda || 0);
                    }
                }
            });
        };

        // Adicionar os dados ao consolidado
        mapConsolidado(orcamentos, 'orcamento');
        mapConsolidado(ordensServico, 'ordemServico');
        mapConsolidado(vendas, 'venda');

        // Montar a resposta com os dados consolidados
        res.status(200).json(consolidado);
    } catch (error) {
        console.error('Erro ao consultar dados diários do mês:', error);
        res.status(500).json({ error: 'Erro ao consultar dados diários do mês' });
    }
}

async function getConsolidadoAnual(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { idFilial } = req.query;

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // Mês atual (0 = Janeiro, 11 = Dezembro)

        // Definindo o intervalo para os últimos 12 meses
        const startOfLast12Months = new Date(currentDate);
        startOfLast12Months.setMonth(currentMonth - 11); // Mês atual - 11 meses atrás
        const endOfLast12Months = new Date(currentDate); // Mês atual (inclusive)

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
        }

        // Consulta orçamentos
        const orcamentos = await Orcamento.findAll({
            where: {
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfLast12Months, endOfLast12Months],
                },
            },
            attributes: [
                [fn('DATE_FORMAT', col('Orcamento.createdAt'), '%Y-%m'), 'mes'],
                [fn('COUNT', col('Orcamento.id')), 'QtdeOrcamentos'],
                [fn('SUM', col('totais.total')), 'totalOrcamento'],
            ],
            group: ['mes'],
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

        // Consulta ordens de serviço
        const ordensServico = await OrdemServico.findAll({
            where: {
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfLast12Months, endOfLast12Months],
                },
            },
            attributes: [
                [fn('DATE_FORMAT', col('OrdemServico.createdAt'), '%Y-%m'), 'mes'],
                [fn('COUNT', col('OrdemServico.id')), 'QtdeOS'],
                [fn('SUM', literal('DISTINCT valorTotal')), 'totalValorServicos'],
            ],
            group: ['mes'],
            raw: true
        });

        // Consulta vendas
        const vendas = await Venda.findAll({
            where: {
                ...whereConditions,
                createdAt: {
                    [Op.between]: [startOfLast12Months, endOfLast12Months],
                },
            },
            attributes: [
                [fn('DATE_FORMAT', col('Venda.createdAt'), '%Y-%m'), 'mes'],
                [fn('COUNT', col('Venda.id')), 'QtdeVenda'],
                [fn('SUM', literal('DISTINCT valorTotal')), 'totalValorVendas'],
            ],
            group: ['mes'],
            raw: true
        });

        // Nomes dos meses (em ordem crescente)
        const nomesMeses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        // Inicializar o consolidado para os últimos 12 meses
        const consolidado = {};

        // Inicialize a chave para todos os meses dos últimos 12 meses, começando do mês atual
        for (let i = 0; i < 12; i++) {
            const mesIndex = (currentMonth - i + 12) % 12; // Para pegar os meses anteriores de forma cíclica

            // Ajustar o ano: se o mês for anterior ao mês atual, subtrair 1 do ano
            const anoCorrigido = currentMonth - i < 0 ? currentYear - 1 : currentYear;

            const mesAno = `${anoCorrigido}-${(mesIndex + 1).toString().padStart(2, '0')}`;
            consolidado[mesAno] = {
                totalOrcamento: 0,
                QtdeOrcamentos: 0,
                totalValorServicos: 0,
                QtdeOS: 0,
                totalValorVendas: 0,
                QtdeVenda: 0,
            };
        }

        // Adicionar orçamentos ao consolidado
        orcamentos.forEach(item => {
            if (consolidado[item.mes]) {
                consolidado[item.mes].totalOrcamento += parseFloat(item.totalOrcamento) || 0;
                consolidado[item.mes].QtdeOrcamentos += parseInt(item.QtdeOrcamentos) || 0;
            }
        });

        // Adicionar ordens de serviço ao consolidado
        ordensServico.forEach(item => {
            if (consolidado[item.mes]) {
                consolidado[item.mes].totalValorServicos += parseFloat(item.totalValorServicos) || 0;
                consolidado[item.mes].QtdeOS += parseInt(item.QtdeOS) || 0;
            }
        });

        // Adicionar vendas ao consolidado
        vendas.forEach(item => {
            if (consolidado[item.mes]) {
                consolidado[item.mes].totalValorVendas += parseFloat(item.totalValorVendas) || 0;
                consolidado[item.mes].QtdeVenda += parseInt(item.QtdeVenda) || 0;
            }
        });

        // Organizar a resposta com os dados para cada mês
        const resultado = [];

        // Garantir que os meses sejam retornados do mês atual para os anteriores
        for (let i = 0; i < 12; i++) {
            const mesIndex = (currentMonth - i + 12) % 12; // Para pegar os meses anteriores de forma cíclica

            // Ajustar o ano
            const anoCorrigido = currentMonth - i < 0 ? currentYear - 1 : currentYear;

            const mesAno = `${anoCorrigido}-${(mesIndex + 1).toString().padStart(2, '0')}`;
            const mesNome = nomesMeses[mesIndex];

            // console.log(mesNome, mesIndex, mesAno, currentMonth, currentYear);

            resultado.push({
                mes: mesNome,
                ...consolidado[mesAno],
            });
        }

        // Retorna os dados organizados corretamente (do mês atual até os anteriores)
        res.status(200).json(resultado);
    } catch (error) {
        console.error('Erro ao consultar dados mensais:', error);
        res.status(500).json({ error: 'Erro ao consultar dados mensais' });
    }
}

async function listMensagens(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { search, month, idFilial } = req.query;

        // Calcular o intervalo de datas para o mês corrente ou o mês especificado
        const currentYear = moment().year();
        // Mês é 1-based em moment
        const monthToCheck = month ? parseInt(month, 10) : moment().month() + 1; 
        const monthPadded = String(monthToCheck).padStart(2, '0');
        // const startDate = moment(`${currentYear}-${monthToCheck}-01`).startOf('month');
        const startDate = moment(`${currentYear}-${monthPadded}-01`, 'YYYY-MM-DD').startOf('month');
        const endDate = moment(startDate).endOf('month');
        
        // Calcule a data de um ano atrás
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoDate = oneYearAgo.toISOString().split('T')[0];

        // Data corrente
        const today = moment().format('YYYY-MM-DD');

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
        }

        // Consulta de clientes com aniversário no mês
        const clientes = await Cliente.findAll({
            where: {
                ...whereConditions,
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
                ...whereConditions,
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
                ...whereConditions,
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
                ...whereConditions,
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
    listMensagens,
    getConsolidadoMensal,
    getConsolidadoAnual
};