// models/OrdemProduto.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Orcamento = require('./Orcamento');
// const Orcamento = require('../models/Orcamento');

class OrcamentoProduto extends Model {}

OrcamentoProduto.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
 },
//  idOrdemServico: {
//     type: DataTypes.INTEGER,
//     allowNull: true
//  },
 idOrcamento: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 idProduto: {
   type: DataTypes.INTEGER,
   allowNull: true
},
 referencia: {
    type: DataTypes.STRING(50),
    allowNull: true
 },
 codigoBarras: {
   type: DataTypes.STRING(15),
   allowNull: true
},
 ncm: {
    type: DataTypes.STRING(20),
    allowNull: true
 },
 descricao: {
    type: DataTypes.STRING(200),
    allowNull: true
 },
 quantidade: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 unidadeMedida: {
   type: DataTypes.STRING(255),
   allowNull: true
},
 marca: {
   type: DataTypes.STRING(255),
   allowNull: true
},
 preco: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
 },
 valorTotal: {
    type: DataTypes.DECIMAL(5, 2),
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
 modelName: 'OrcamentoProduto',
 tableName: 'orcamentoProdutos'
});

module.exports = OrcamentoProduto;
