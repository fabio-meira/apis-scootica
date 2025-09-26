// models/index.js ou em um arquivo separado dedicado às associações

const Orcamento = require('./Orcamento');
const OrdemProduto = require('./OrdemProduto');
const OrdemProdutoTotal = require('./OrdemProdutoTotal');
const FormaRecebimento = require('./FormaRecebimento');
const ParametrosJuros = require('./parametrosJuros');

Orcamento.hasMany(OrdemProduto, {
    foreignKey: 'idOrcamento',
    as: 'produtos'
});

OrdemProduto.belongsTo(Orcamento, {
    foreignKey: 'idOrcamento',
    as: 'orcamento'
});

OrdemProdutoTotal.belongsTo(Orcamento, {
    foreignKey: 'idOrcamento',
    as: 'totais'
});

FormaRecebimento.hasMany(ParametrosJuros, {
  foreignKey: 'idFormaPagamento',
  as: 'parametrosJuros'
});

ParametrosJuros.belongsTo(FormaRecebimento, {
  foreignKey: 'idFormaPagamento',
  as: 'formaRecebimento'
});


// Defina outras associações conforme necessário
