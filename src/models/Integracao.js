const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Integracao extends Model {}

Integracao.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 idFilial: {
    type: DataTypes.STRING(15),
    allowNull: true,
 },
 tipoIntegracao: {
    type: DataTypes.STRING(50),
    allowNull: false,
 },
 nomeIntegracao: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 url: {
    type: DataTypes.STRING(1000),
    allowNull: true,
 },
 token: {
    type: DataTypes.TEXT,
    allowNull: true,
 },
 usuario: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 senha: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 tokenJwt: {
    type: DataTypes.TEXT,
    allowNull: true,
 },
 refreshTokenJwt: {
    type: DataTypes.TEXT,
    allowNull: true,
 },
 ambiente: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: true,
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
 modelName: 'Integracao',
 tableName: 'integracoes',
});

module.exports = Integracao;
