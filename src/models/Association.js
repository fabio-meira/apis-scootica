const Medico = require('./Medico');
const Receita = require('./Receita');
const Cliente = require('./Cliente');
const Pagamento = require('./Pagamento');
const Venda = require('./Venda');

Medico.hasMany(Receita, {
    foreignKey: 'idMedico',
    as: 'receitas',
});

Receita.belongsTo(Medico, {
    foreignKey: 'idMedico',
    as: 'medico',
});

Receita.belongsTo(Cliente, {
    foreignKey: 'idCliente',
    as: 'paciente',
});

Pagamento.belongsTo(Venda, { 
    foreignKey: 'idVenda', 
    as: 'venda' 
});

module.exports = { Medico, Receita, Cliente, Pagamento };
