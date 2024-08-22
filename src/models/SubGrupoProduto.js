// models/SubGrupoProduto.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const GrupoProduto = require('../models/GrupoProduto');

class SubGrupoProduto extends Model {}

SubGrupoProduto.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 idGrupoProduto: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 nome: {
    type: DataTypes.STRING(500),
    allowNull: true,
 },
 situacao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
 },
 createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
 },
 updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
 },
}, {
 sequelize,
 modelName: 'SubGrupoProduto',
 tableName: 'subGrupoProdutos',
});

// relacionamentos para os includes
SubGrupoProduto.belongsTo(GrupoProduto, {
   foreignKey: 'idGrupoProduto',
   as: 'grupoProduto'
});

module.exports = SubGrupoProduto;
