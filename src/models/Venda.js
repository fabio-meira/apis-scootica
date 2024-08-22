// models/Venda.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Pagamento = require('../models/Pagamento');
const VendaProduto = require('../models/VendaProduto');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Cliente = require('../models/Cliente');
const Laboratorio = require('../models/Laboratorio')
const Vendedor = require('./Vendedor');
const Receituario = require('./Receita');
const Empresa = require('../models/Empresa');

class Venda extends Model {}

Venda.init({
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
  idOrdemServico: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idCliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idReceita: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idVendedor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idLaboratorio: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dtEstimadaEntrega: {
    type: DataTypes.DATE,
    allowNull: true
  },
  aro: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  ponte: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  diagonalMaior: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  verticalAro: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  enviadoLaboratorio: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  observacoesArmacao: {
   type: DataTypes.STRING(1000),
   allowNull: true
  },
  situacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  origemVenda: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  observacoes: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  valorTotal: {
    type: DataTypes.DECIMAL(9, 2),
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
  modelName: 'Venda',
  tableName: 'vendas'
});

// Relacionamentos
Venda.belongsTo(Empresa, {
  foreignKey: 'idEmpresa',
  targetKey: 'idEmpresa', 
  as: 'empresa'
});

Venda.hasMany(Pagamento, {
    foreignKey: 'idVenda',
    as: 'pagamentos'
  });

Venda.hasMany(VendaProduto, {
  foreignKey: 'idVenda',
  as: 'produtos' 
});

Venda.hasOne(OrdemProdutoTotal, {
  foreignKey: 'idVenda',
  as: 'totais' 
});

Venda.belongsTo(Cliente, {
  foreignKey: 'idCliente',
  as: 'cliente'
});

Venda.belongsTo(Vendedor, {
  foreignKey: 'idVendedor',
  as: 'vendedor'
});

Venda.belongsTo(Laboratorio, {
  foreignKey: 'idLaboratorio',
  as: 'laboratorio'
});

Venda.belongsTo(Receituario, {
  foreignKey: 'idReceita',
  as: 'receita' 
});  

module.exports = Venda;

