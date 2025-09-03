const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Ibpt extends Model {}

Ibpt.init({
   id: {
     type: DataTypes.INTEGER,
     allowNull: false,
     primaryKey: true,
     autoIncrement: true
   },
   Codigo: {
      type: DataTypes.STRING(20),
      primaryKey: false,
   },
   Descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
   },
   nacionalFederal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
   },
   importadosfederal: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
   },
   estadual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
   },
   vigenciainicio: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   vigenciafim: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   chave: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   versao: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   uf: {
      type: DataTypes.STRING(2),
      allowNull: true,
   },
   cUf: {
      type: DataTypes.INTEGER,
      allowNull: true,
   },
}, 
{
 sequelize,
 modelName: 'Ibpt',
 tableName: 'ibpt',
 timestamps: false 
});

module.exports = Ibpt;
