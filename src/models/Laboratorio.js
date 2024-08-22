const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Laboratorio extends Model {}

Laboratorio.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 idLaboratorio: {
    type: DataTypes.STRING(14),
    allowNull: true,
 },
 razaoSocial: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 nomeFantasia: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 cnpj: {
    type: DataTypes.STRING(14),
    allowNull: false,
 },
 ie: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 im: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 email: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 telefone: {
    type: DataTypes.STRING(30),
    allowNull: true,
 },
 celular: {
    type: DataTypes.STRING(30),
    allowNull: true,
 },
 ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
 },
 tipoEndereco: {
    type: DataTypes.STRING(50),
    allowNull: true,
 },
 logradouro: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 numero: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 complemento: {
    type: DataTypes.STRING(300),
    allowNull: true,
 },
 bairro: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 cep: {
    type: DataTypes.STRING(10),
    allowNull: true,
 },
 cidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 estado: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 pais: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 outrosDados: {
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
 modelName: 'Laboratorio',
 tableName: 'laboratorios',
});

module.exports = Laboratorio;
