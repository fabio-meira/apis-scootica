const Medico = require('./Medico');
const Receita = require('./Receita');
const Cliente = require('./Cliente');
const Pagamento = require('./Pagamento');
const Venda = require('./Venda');
const Usuario = require('./Usuario');
const Empresa = require('./Empresa');
const Auth = require('./Authentication');
const Filial = require('./Filial');

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

// Usuario
Usuario.belongsTo(Empresa, { foreignKey: 'idEmpresa', targetKey: 'idEmpresa', as: 'empresa' });
Usuario.belongsTo(Auth, { foreignKey: 'idEmpresa', targetKey: 'idEmpresa', as: 'token' });
Usuario.belongsTo(Filial, { foreignKey: 'idFilial', targetKey: 'idFilial', as: 'filial' });

// Empresa
Empresa.hasOne(Auth, { foreignKey: 'idEmpresa', as: 'auth' });

module.exports = { Medico, Receita, Cliente, Pagamento, Usuario, Empresa, Auth};
