// models/Orcamento.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const OrcamentoProduto = require('../models/OrcamentoProduto');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Cliente = require('../models/Cliente');
const Laboratorio = require('../models/Laboratorio')
const Vendedor = require('./Vendedor');
const Receituario = require('./Receita');
const Empresa = require('../models/Empresa');

class Orcamento extends Model {}

Orcamento.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
 },
 idEmpresa: {
   type: DataTypes.STRING(100),
   allowNull: false
},
idFilial: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
numeroOR: {
   type: DataTypes.INTEGER,
   allowNull: false
},
idCliente: {
   type: DataTypes.INTEGER,
   allowNull: false
},
 idVendedor: {
    type: DataTypes.INTEGER,
    allowNull: false
 },
 idReceita: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 idFornecedor: {
    type: DataTypes.INTEGER,
    allowNull: true
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
 idPagamento: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 origemVenda: {
    type: DataTypes.STRING(50),
    allowNull: true
 },
 situacao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: 0
 },
 observacoes: {
    type: DataTypes.STRING(1000),
    allowNull: true
 },
 idLead: {
  type: DataTypes.INTEGER,
  allowNull: true,
 },
 integradoCRM: {
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
 modelName: 'Orcamento',
 tableName: 'orcamentos'
});

// relacionamentos para os includes
Orcamento.belongsTo(Empresa, {
   foreignKey: 'idEmpresa',
   targetKey: 'idEmpresa', 
   as: 'empresa'
 });

Orcamento.hasMany(OrcamentoProduto, {
   foreignKey: 'idOrcamento',
   as: 'produtos' 
});

Orcamento.hasOne(OrdemProdutoTotal, {
   foreignKey: 'idOrcamento',
   as: 'totais' 
});

Orcamento.belongsTo(Cliente, {
   foreignKey: 'idCliente',
   as: 'cliente'
});

Orcamento.belongsTo(Vendedor, {
   foreignKey: 'idVendedor',
   as: 'vendedor'
});

Orcamento.belongsTo(Laboratorio, {
   foreignKey: 'idLaboratorio',
   as: 'laboratorio'
});

Orcamento.belongsTo(Receituario, {
   foreignKey: 'idReceita',
   as: 'receita' 
});

module.exports = Orcamento;
