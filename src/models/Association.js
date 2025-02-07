const Medico = require('./Medico');
const Receita = require('./Receita');
const Cliente = require('./Cliente');

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

module.exports = { Medico, Receita, Cliente };
