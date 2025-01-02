const { Op } = require('sequelize');
const Pagamento = require('../models/Pagamento');
const EntradaSaida = require('../models/EntradaSaida');
const Conta = require('../models/Conta');
const Venda = require('../models/Venda');  
const moment = require('moment'); 

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

        // Somar as receitas
        const receitas = await Promise.all([
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

            // 2. Receitas - Entradas no EntradaSaida (considerar tipo = 1 para receitas)
            EntradaSaida.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 1, 
                    dtInclusao: {
                        [Op.between]: [startOfMonth, endOfMonth] 
                    }
                }
            }),

            // 3. Receitas - Contas a receber no mês corrente
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

        const totalReceitas = {
            entradaSaida: receitas[1] || 0,
            vendas: receitas[0] || 0,
            contasAReceber: receitas[2] || 0
        };

        const totalReceitasValor = totalReceitas.entradaSaida + totalReceitas.vendas + totalReceitas.contasAReceber;

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

        const totalDespesas = {
            entradaSaida: despesas[0] || 0,
            contasAPagar: despesas[1] || 0
        };

        const totalDespesasValor = totalDespesas.entradaSaida + totalDespesas.contasAPagar;

        // Calcular o percentual das despesas em relação às receitas
        const percentualDespesas = totalReceitasValor > 0 ? (totalDespesasValor / totalReceitasValor) * 100 : 0;

        // Enviar a resposta com as separações de receitas e despesas, e as datas de início e fim
        res.json({
            periodo: {
                mes: moment(startOfMonth).format('MMMM'), 
                inicio: startOfMonth,
                fim: endOfMonth
            },
            receitas: totalReceitas,
            despesas: totalDespesas,
            totalReceitas: totalReceitasValor,
            totalDespesas: totalDespesasValor,
            saldo: totalReceitasValor - totalDespesasValor,
            percentualDespesas: percentualDespesas.toFixed(2) 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao calcular o financeiro' });
    }
}

// Função assíncrona que calcula as receitas e despesas para um mês específico
async function getFinanceiroSum(idEmpresa, startOfMonth, endOfMonth) {
    try {
        // Somar as receitas
        const receitas = await Promise.all([
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

            // 2. Receitas - Entradas no EntradaSaida (considerar tipo = 1 para receitas)
            EntradaSaida.sum('valor', {
                where: {
                    idEmpresa: idEmpresa,
                    tipo: 1, 
                    dtInclusao: {
                        [Op.between]: [startOfMonth, endOfMonth] 
                    }
                }
            }),

            // 3. Receitas - Contas a receber no mês corrente
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

        const totalReceitas = {
            entradaSaida: receitas[1] || 0,
            vendas: receitas[0] || 0,
            contasAReceber: receitas[2] || 0
        };

        const totalReceitasValor = totalReceitas.entradaSaida + totalReceitas.vendas + totalReceitas.contasAReceber;

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

        const totalDespesas = {
            entradaSaida: despesas[0] || 0,
            contasAPagar: despesas[1] || 0
        };

        const totalDespesasValor = totalDespesas.entradaSaida + totalDespesas.contasAPagar;

        // Calcular o percentual das despesas em relação às receitas
        const percentualDespesas = totalReceitasValor > 0 ? (totalDespesasValor / totalReceitasValor) * 100 : 0;

        return {
            periodo: {
                mes: moment(startOfMonth).format('MMMM'), 
                inicio: startOfMonth,
                fim: endOfMonth
            },
            receitas: totalReceitas,
            despesas: totalDespesas,
            totalReceitas: totalReceitasValor,
            totalDespesas: totalDespesasValor,
            saldo: (totalReceitasValor - totalDespesasValor).toFixed(2),
            percentualDespesas: percentualDespesas.toFixed(2) 
        };

    } catch (error) {
        console.error(error);
        throw new Error('Erro ao calcular o financeiro');
    }
}

// Função principal para retornar os últimos 12 meses
async function getFinanceiromeses(req, res) {
    try {
        const { idEmpresa } = req.params; 

        if (!idEmpresa) {
            return res.status(400).json({ message: 'idEmpresa é necessário.' });
        }

        const meses = [];
        const hoje = moment(); // Data atual
        
        // Iterar sobre os últimos 12 meses
        for (let i = 0; i < 12; i++) {
            const startOfMonth = hoje.clone().subtract(i, 'months').startOf('month').toDate();
            const endOfMonth = hoje.clone().subtract(i, 'months').endOf('month').toDate();

            // Chama a função getFinanceiroSum para cada mês
            const financeiroMes = await getFinanceiroSum(idEmpresa, startOfMonth, endOfMonth);
            meses.push(financeiroMes);
        }

        // Retorna os dados dos últimos 12 meses
        res.json({ meses });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao calcular o financeiro para os últimos 12 meses.' });
    }
}

module.exports = {
    getFinanceiro,
    getFinanceiromeses
};