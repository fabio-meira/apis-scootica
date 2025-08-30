// models/Cliente.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Cliente extends Model {}

Cliente.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
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
 genero: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 dtNascimento: {
    type: DataTypes.DATE,
    allowNull: true,
 },
 naturalidade: {
    type: DataTypes.STRING(200),
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
 estadoCivil: {
    type: DataTypes.STRING(10),
    allowNull: true,
 },
 conjuge: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 nomePai: {
    type: DataTypes.STRING(500),
    allowNull: true,
 },
 nomeMae: {
    type: DataTypes.STRING(500),
    allowNull: true,
 },
 email: {
    type: DataTypes.STRING(150),
    allowNull: true,
 },
 profissao: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 localTrabalho: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 rendaMensal: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true,
 },
 dtAdmissao: {
    type: DataTypes.DATE,
    allowNull: true,
 },
 outrasInformacoes: {
    type: DataTypes.STRING(1000),
    allowNull: true,
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
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 complemento: {
    type: DataTypes.STRING(300),
    allowNull: true,
 },
 cep: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 bairro: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 cidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 codCidade: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 estado: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 codUF: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 pais: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 ativo: {
   type: DataTypes.BOOLEAN,
   allowNull: true,
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
 modelName: 'Cliente',
 tableName: 'clientes',
});

module.exports = Cliente;
