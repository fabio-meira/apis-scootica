// models/index.js ou em um arquivo separado dedicado às associações

const Orcamento = require('./Orcamento');
const OrdemProduto = require('./OrdemProduto');
const OrdemProdutoTotal = require('./OrdemProdutoTotal');

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

// Defina outras associações conforme necessário
