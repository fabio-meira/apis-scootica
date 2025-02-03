const { Op } = require('sequelize');
const Pagamento = require('../models/Pagamento');
const EntradaSaida = require('../models/EntradaSaida');
const Conta = require('../models/Conta');
const Venda = require('../models/Venda');  
const Empresa = require('../models/Empresa');
const moment = require('moment'); 
require('moment/locale/pt-br'); 

// Função assíncrona que calcula as receitas e despesas do mês corrente
async function getFinanceiro(req, res) {
    try {
        const { idEmpresa } = req.params;

        if (!idEmpresa) {
            return res.status(400).json({ message: 'idEmpresa é necessário.' });
        }

        // Obter o início e o fim do mês atual
        const startOfMonth = moment().startOf('month').toDate();
        const endOfMonth = moment().endOf('month').toDate();


        // Somar as receitas e contar as vendas
        const [totalVendasValor, totalVendas, entradas, contasAReceber] = await Promise.all([
            // 1. Receitas - Pagamentos (com idVenda preenchido, usando join com Venda)
            Venda.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    createdAt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                },
                include: [{
                    model: Pagamento,
                    as: 'pagamentos',
                    required: true,
                    attributes: [],
                }]
            }),

            // 2. Contar o número de vendas
            Venda.count({
                where: {
                    idEmpresa: idEmpresa,
                    createdAt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // 3. Receitas - Entradas no EntradaSaida (considerar tipo = 1 para receitas)
            EntradaSaida.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 1,
                    dtInclusao: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // 4. Receitas - Contas a receber no mês corrente
            Conta.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 'Receber',
                    statusRecebimento: 'Pendente',
                    dataVencimento: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            })
        ]);

        // Calcular o total de receitas (somando todos os valores)
        const totalReceitasValor = (totalVendasValor || 0) + (entradas || 0) + (contasAReceber || 0);

        // Calcular a média das vendas
        const mediaVendas = totalVendas > 0 ? totalVendasValor / totalVendas : 0; 

        // Somar as despesas
        const despesas = await Promise.all([
            // 1. Despesas - Saídas no EntradaSaida (considerar tipo = 0 para despesas)
            EntradaSaida.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 0,
                    dtInclusao: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // 2. Despesas - Contas a pagar no mês corrente
            Conta.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 'Pagar',
                    statusRecebimento: 'Pendente',
                    dataVencimento: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            })
        ]);

        // Calcular o total de despesas
        const totalDespesasValor = (despesas[0] || 0) + (despesas[1] || 0);

        // Calcular o percentual das despesas em relação às receitas
        const percentualDespesas = totalReceitasValor > 0 ? (totalDespesasValor / totalReceitasValor) * 100 : 0;

        // Calcular o percentual das despesas em relação às receitas
        const percentualSaldo = 100 - percentualDespesas;

        const ano = moment(startOfMonth).year(); 

        // Enviar a resposta com as separações de receitas e despesas, e as datas de início e fim
        res.json({
            periodo: {
                mes: moment(startOfMonth).locale('pt-br').format('MMMM').charAt(0).toUpperCase() + moment(startOfMonth).locale('pt-br').format('MMMM').slice(1),
                ano: ano,
                inicio: startOfMonth,
                fim: endOfMonth
            },
            receitas: {
                qtdeVendas: totalVendas || 0,
                vendas: totalVendasValor || 0,
                ticketMedioVendas: mediaVendas.toFixed(2) || 0,
                entradas: entradas || 0,
                contasAReceber: contasAReceber || 0
            },
            despesas: {
                entradasSaida: despesas[0] || 0,
                contasAPagar: despesas[1] || 0
            },
            totalReceitas: totalReceitasValor,
            totalDespesas: totalDespesasValor,
            saldo: (totalReceitasValor - totalDespesasValor).toFixed(2),
            percentualDespesas: percentualDespesas.toFixed(2),
            percentualSaldo: percentualSaldo.toFixed(2)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao calcular o financeiro' });
    }
}

// Função assíncrona que calcula as receitas e despesas para um mês específico
async function getFinanceiroSum(idEmpresa, startOfMonth, endOfMonth) {
    try {
        const mes = moment(startOfMonth).locale('pt-br').format('MMMM').charAt(0).toUpperCase() + moment(startOfMonth).locale('pt-br').format('MMMM').slice(1); // Mês por extenso
        const ano = moment(startOfMonth).year();
        // Somar as receitas e contar as vendas
        const [totalVendasValor, totalVendas, entradas, contasAReceber] = await Promise.all([
            // 1. Receitas - Pagamentos (com idVenda preenchido, usando join com Venda)
            Venda.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    createdAt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                },
                include: [{
                    model: Pagamento,
                    as: 'pagamentos',
                    required: true,
                    attributes: [],
                }]
            }),

            // 2. Contar o número de vendas
            Venda.count({
                where: {
                    idEmpresa: idEmpresa,
                    createdAt: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // 3. Receitas - Entradas no EntradaSaida (considerar tipo = 1 para receitas)
            EntradaSaida.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 1,
                    dtInclusao: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // 4. Receitas - Contas a receber no mês corrente
            Conta.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 'Receber',
                    statusRecebimento: 'Pendente',
                    dataVencimento: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            })
        ]);

        // Calcular o total de receitas (somando todos os valores)
        const totalReceitasValor = (totalVendasValor || 0) + (entradas || 0) + (contasAReceber || 0);

        // Calcular a média das vendas
        const mediaVendas = totalVendas > 0 ? totalVendasValor / totalVendas : 0;

        // Somar as despesas
        const despesas = await Promise.all([
            // 1. Despesas - Saídas no EntradaSaida (considerar tipo = 0 para despesas)
            EntradaSaida.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 0,
                    dtInclusao: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            }),

            // 2. Despesas - Contas a pagar no mês corrente
            Conta.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 'Pagar',
                    statusRecebimento: 'Pendente',
                    dataVencimento: {
                        [Op.between]: [startOfMonth, endOfMonth]
                    }
                }
            })
        ]);

        // Calcular o total de despesas
        const totalDespesasValor = (despesas[0] || 0) + (despesas[1] || 0);

        // Calcular o percentual das despesas em relação às receitas
        const percentualDespesas = totalReceitasValor > 0 ? (totalDespesasValor / totalReceitasValor) * 100 : 0;

        // Calcular o percentual das despesas em relação às receitas
        const percentualSaldo = 100 - percentualDespesas;

        // Enviar a resposta com as separações de receitas e despesas, e as datas de início e fim
        return({
            periodo: {
                mes: mes,
                ano: ano, 
                inicio: startOfMonth,
                fim: endOfMonth
            },
            receitas: {
                qtdeVendas: totalVendas,
                vendas: totalVendasValor || 0,
                ticketMedioVendas: mediaVendas.toFixed(2) || 0,
                entradas: entradas || 0,
                contasAReceber: contasAReceber || 0
            },
            despesas: {
                entradasSaida: despesas[0] || 0,
                contasAPagar: despesas[1] || 0
            },
            totalReceitas: totalReceitasValor.toFixed(2),
            totalDespesas: totalDespesasValor.toFixed(2),
            saldo: (totalReceitasValor - totalDespesasValor).toFixed(2),
            percentualDespesas: percentualDespesas.toFixed(2),
            percentualSaldo: percentualSaldo.toFixed(2)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao calcular o financeiro' });
    }
}

// Função principal para retornar os últimos 12 meses
async function getFinanceiroMeses(req, res) {
    try {
        const { idEmpresa } = req.params; 

        if (!idEmpresa) {
            return res.status(400).json({ message: 'idEmpresa é necessário.' });
        }

        const meses = [];
        // Data atual
        const hoje = moment(); 
        
        // Iterar sobre os últimos 12 meses
        for (let i = 0; i < 12; i++) {
            const startOfMonth = hoje.clone().subtract(i, 'months').startOf('month').toDate();
            const endOfMonth = hoje.clone().subtract(i, 'months').endOf('month').toDate();
            const ano = moment(startOfMonth).year(); 

            // Chama a função getFinanceiroSum para cada mês
            const financeiroMes = await getFinanceiroSum(idEmpresa, startOfMonth, endOfMonth, ano);
            meses.push(financeiroMes);
        }

        // Retorna os dados dos últimos 12 meses
        res.json({ meses });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao calcular o financeiro para os últimos 12 meses.' });
    }
}

async function getFinanceiroMes(req, res) {
    try {
        const { idEmpresa, mes, ano } = req.params;

        if (!idEmpresa || !mes || !ano) {
            return res.status(400).json({ message: 'idEmpresa, mes e ano são necessários.' });
        }

        // Convertendo o nome do mês para o número do mês (ex: "janeiro" -> 1)
        const meses = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];

        const mesNumero = meses.indexOf(mes.toLowerCase()) + 1;
        if (mesNumero === 0) {
            return res.status(400).json({ message: 'Mês inválido.' });
        }

        // Definir o primeiro e o último dia do mês
        const startOfMonth = moment(`${ano}-${mesNumero}-01`, 'YYYY-MM-DD').startOf('month').toDate();
        const endOfMonth = moment(startOfMonth).endOf('month').toDate();

        // Chama a função getFinanceiroSum para o mês específico
        const financeiroMes = await getFinanceiroSum(idEmpresa, startOfMonth, endOfMonth);

        // Obter os detalhes das contas a pagar
        const contasAPagarDetalhadas = await Conta.findAll({
            where: {
                idEmpresa: idEmpresa,
                tipo: 'Pagar',
                statusRecebimento: 'Pendente',
                dataVencimento: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            attributes: ['id', 'descricao', 'valor', 'dataVencimento']
        });

        // Obter os detalhes das contas a receber
        const contasAReceberDetalhadas = await Conta.findAll({
            where: {
                idEmpresa: idEmpresa,
                tipo: 'Receber',
                statusRecebimento: 'Pendente',
                dataVencimento: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            attributes: ['id', 'descricao', 'valor', 'dataVencimento']
        });


        // Obter as informações da empresa
        const empresaDetalhada = await Empresa.findOne({
            where: { idEmpresa: idEmpresa },
            attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'telefone', 'celular']
        });

        if (!empresaDetalhada) {
            return res.status(404).json({ message: 'Empresa não encontrada.' });
        }

        // Adicionar os detalhes de contas a pagar e contas a receber à resposta
        financeiroMes.despesas.contasAPagarDetalhadas = contasAPagarDetalhadas;
        financeiroMes.receitas.contasAReceberDetalhadas = contasAReceberDetalhadas;
        financeiroMes.empresa = empresaDetalhada;

        // Retorna os dados do mês específico
        res.json({ financeiroMes });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao calcular o financeiro para o mês indicado.' });
    }
}

module.exports = {
    getFinanceiro,
    getFinanceiroMeses,
    getFinanceiroMes
};