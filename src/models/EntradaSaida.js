// models/EntradaSaida.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Usuario = require('./Usuario');

class EntradaSaida extends Model {}

EntradaSaida.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idCaixa: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dtInclusao: {
    type: DataTypes.DATE,
    allowNull: true
  },
  valor: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
  },
  tipo: {
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
  modelName: 'EntradaSaida',
  tableName: 'entradaSaida'
});

// // Relacionamentos
EntradaSaida.belongsTo(Usuario, {
  foreignKey: 'idUsuario',
  as: 'usuario'
});

// Caixa.hasMany(Venda, {
//   foreignKey: 'idCaixa',
//   as: 'vendas'
// });


module.exports = EntradaSaida;

