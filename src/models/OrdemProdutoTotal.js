// models/OrdemProdutoTotal.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class OrdemProdutoTotal extends Model {}

OrdemProdutoTotal.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
 },
 idOrdemServico: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 idOrcamento: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 idVenda: { 
   type: DataTypes.INTEGER,
   allowNull: true
},
 quantidadeTotal: {
   type: DataTypes.INTEGER,
   allowNull: true
},
 desconto: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
 },
 Percdesconto: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
 },
 acrescimo: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
 },
 frete: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
 },
 totalProdutos: {
   type: DataTypes.DECIMAL(9, 2),
   allowNull: true
},
 total: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
 },
vlrAlteradoNF: {
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
 modelName: 'OrdemProdutoTotal',
 tableName: 'ordemProdutosTotais'
});

module.exports = OrdemProdutoTotal;
