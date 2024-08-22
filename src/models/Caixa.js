// models/Caixa.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('./Empresa');
const Usuario = require('./Usuario');
const Banco = require('./Banco');
const Venda = require('./Venda'); 
const OrdemServico = require('./OrdemServico');
const EntradaSaida = require('./EntradaSaida');
const Pagamento = require('./Pagamento');

class Caixa extends Model {}

Caixa.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  idUsuarioAbertura: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usuarioAbertura: {
    type: DataTypes.STRING(1000),
    allowNull: true
   },
  idUsuarioFechamento: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usuarioFechamento: {
    type: DataTypes.STRING(1000),
    allowNull: true
   },
  idBanco: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dtAbertura: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dtFechamento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  valorCaixa: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
  },
  situacao: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  observacao: {
   type: DataTypes.STRING(1000),
   allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Caixa',
  tableName: 'caixa'
});

// Relacionamentos
Caixa.belongsTo(Empresa, {
  foreignKey: 'idEmpresa',
  targetKey: 'idEmpresa', 
  as: 'empresa'
});

// Caixa.belongsTo(Usuario, {
//   foreignKey: 'idUsuario',
//   as: 'usuario'
// });

Caixa.belongsTo(Banco, {
  foreignKey: 'idBanco',
  as: 'banco'
});

Caixa.hasMany(Venda, {
  foreignKey: 'idCaixa',
  as: 'vendas'
});

Caixa.hasMany(EntradaSaida, {
  foreignKey: 'idCaixa',
  as: 'entradaSaida'
});

// Caixa.hasMany(OrdemServico, {
//     foreignKey: 'idCaixa',
//     as: 'ordensServico'
//   });

// Caixa.hasMany(Pagamento, {
//   foreignKey: 'idCaixa',
//   as: 'pagamento'
// });

module.exports = Caixa;

