const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('./Empresa');

class Medico extends Model {}

Medico.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idMedico: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   idEmpresa: {
      type: DataTypes.STRING(50),
      allowNull: true,
   },
   cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
   },
   rg: {
      type: DataTypes.STRING(9),
      allowNull: true,
   },
   registro: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   nomeCompleto: {
      type: DataTypes.STRING(255),
      allowNull: false,
   },
   apelido: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   email: {
      type: DataTypes.STRING(255),
      allowNull: false,
   },
   telefone: {
      type: DataTypes.STRING(15),
      allowNull: true,
   },
   celular: {
      type: DataTypes.STRING(15),
      allowNull: false,
   },
   complemento: {
      type: DataTypes.STRING(255),
      allowNull: true,
   },
   observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
   },
   createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
   },
   updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
   },
}, 
{
 sequelize,
 modelName: 'Medico',
 tableName: 'medicos',
});

Medico.belongsTo(Empresa, {
   foreignKey: 'idEmpresa',
   targetKey: 'idEmpresa', 
   as: 'empresa'
 });

module.exports = Medico;
