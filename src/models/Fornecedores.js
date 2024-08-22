const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Fornecedor extends Model {}

Fornecedor.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idFornecedor: {
      type: DataTypes.STRING(14),
      allowNull: true,
   },
   idEmpresa: {
      type: DataTypes.STRING(50),
      allowNull: true,
   },
   razaoSocial: {
      type: DataTypes.STRING(200),
      allowNull: false,
   },
   nomeFantasia: {
      type: DataTypes.STRING(200),
      allowNull: false,
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
      allowNull: false,
   },
   telefone: {
      type: DataTypes.STRING(30),
      allowNull: true,
   },
   celular: {
      type: DataTypes.STRING(30),
      allowNull: false,
   },
   laboratorio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
   },
   ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
   estado: {
      type: DataTypes.STRING(200),
      allowNull: true,
   },
   pais: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    outrosDados: {
      type: DataTypes.TEXT,
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
}, 
{
 sequelize,
 modelName: 'Fornecedor',
 tableName: 'fornecedores',
});

module.exports = Fornecedor;
