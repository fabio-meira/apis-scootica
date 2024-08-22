// models/ColecaoProduto.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class ColecaoProduto extends Model {}

ColecaoProduto.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
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
 modelName: 'ColecaoProduto',
 tableName: 'colecaoProdutos',
});

module.exports = ColecaoProduto;
