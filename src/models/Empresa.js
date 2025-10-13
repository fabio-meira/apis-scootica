// models/Empresa.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Empresa extends Model {}

Empresa.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 filiais: {
   type: DataTypes.BOOLEAN,
   allowNull: false,
   defaultValue: false
},
 nome: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 cnpj: {
    type: DataTypes.STRING(14),
    allowNull: true,
 },
 razaoSocial: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 nomeFantasia: {
    type: DataTypes.STRING(500),
    allowNull: true,
 },
 ie: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 im: {
    type: DataTypes.STRING(20),
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
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 bairro: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 cep: {
    type: DataTypes.STRING(10),
    allowNull: true,
 },
 cidade: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 codCidade: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 estado: {
    type: DataTypes.STRING(50),
    allowNull: true,
 },
 codUF: {
    type: DataTypes.STRING(2),
    allowNull: true,
 },
 uf: {
    type: DataTypes.STRING(2),
    allowNull: true,
 },
 pais: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 emiteNF: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
 },
 tipoNF: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 ambienteSefaz: {
    type: DataTypes.STRING(20),
    allowNull: true,
 },
 integracaoCRM: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: 0
  },
 NFSimplesNac: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
 },
 emailXML: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: 0
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
 modelName: 'Empresa',
 tableName: 'empresas',
});

module.exports = Empresa;
