const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Vendedor extends Model {}

Vendedor.init({
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
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 cpf: {
    type: DataTypes.STRING(11),
    allowNull: true,
 },
 rg: {
    type: DataTypes.STRING(10),
    allowNull: true,
 },
 nomeCompleto: {
    type: DataTypes.STRING(500),
    allowNull: true,
 },
 email: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 genero: {
    type: DataTypes.STRING(15),
    allowNull: true,
 },
 telefone: {
    type: DataTypes.STRING(15),
    allowNull: true,
 },
 celular: {
    type: DataTypes.STRING(15),
    allowNull: true,
 },
 dtNascimento: {
    type: DataTypes.DATE,
    allowNull: true,
 },
 comissao: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
 },
 observacoes: {
    type: DataTypes.STRING(1000),
    allowNull: true,
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
 modelName: 'Vendedor',
 tableName: 'vendedores',
});

module.exports = Vendedor;
