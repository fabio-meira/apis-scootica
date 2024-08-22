const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Banco extends Model {}

Banco.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idEmpresa: {
      type: DataTypes.STRING(50),
      allowNull: true,
   },
   codigoBanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   nomeBanco: {
      type: DataTypes.STRING(1000),
      allowNull: true,
   },
   nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
   },
   agencia: {
      type: DataTypes.STRING(10),
      allowNull: false,
   },
   contaCorrente: {
      type: DataTypes.STRING(30),
      allowNull: false,
   },
   digitoConta: {
      type: DataTypes.STRING(2),
      allowNull: false,
   },
   situacao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
   },
}, 
{
 sequelize,
 modelName: 'Banco',
 tableName: 'bancos',
 timestamps: false 
});

module.exports = Banco;
