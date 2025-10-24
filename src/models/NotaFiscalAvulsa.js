// models/NotaFiscalAvulsa.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
// const Pagamento = require('../models/Pagamento');
const VendaProduto = require('../models/VendaProduto');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Cliente = require('../models/Cliente');
const Vendedor = require('./Vendedor');
const Empresa = require('../models/Empresa');
const NotaFiscal = require('./NotaFiscal');

class NotaFiscalAvulsa extends Model {}

NotaFiscalAvulsa.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idCaixa: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  idNotaFiscal: {
   type: DataTypes.INTEGER,
   allowNull: true,
  },
  idFilial: {
   type: DataTypes.STRING(100),
   allowNull: true,
  },
  tipoNFe: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  idCliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idVendedor: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  situacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  valorTotal: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
  },
  notaFiscalEmitida: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
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
  modelName: 'NotaFiscalAvulsa',
  tableName: 'notaFiscalAvulsa'
});

// Relacionamentos
NotaFiscalAvulsa.belongsTo(Empresa, {
  foreignKey: 'idEmpresa',
  targetKey: 'idEmpresa', 
  as: 'empresa'
});

NotaFiscalAvulsa.hasMany(VendaProduto, {
  foreignKey: 'idNotaAvulsa',
  as: 'produtos' 
});

NotaFiscalAvulsa.hasOne(OrdemProdutoTotal, {
  foreignKey: 'idNotaAvulsa',
  as: 'totais' 
});

NotaFiscalAvulsa.belongsTo(Cliente, {
  foreignKey: 'idCliente',
  as: 'cliente'
});

NotaFiscalAvulsa.belongsTo(Vendedor, {
  foreignKey: 'idVendedor',
  as: 'vendedor'
});

NotaFiscalAvulsa.belongsTo(NotaFiscal, {
  foreignKey: 'idNotaFiscal',
  as: ' notaFiscal'
});

module.exports = NotaFiscalAvulsa;