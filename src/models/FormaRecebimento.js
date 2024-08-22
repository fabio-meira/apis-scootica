const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Banco = require('./Banco');

class FormaRecebimento extends Model {}

FormaRecebimento.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idEmpresa: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   idBanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
   },
   descricao: {
      type: DataTypes.STRING(500),
      allowNull: false,
   },
   cnpj: {
      type: DataTypes.STRING(14),
      allowNull: true,
   },
   tipoRecebimento: {
    type: DataTypes.STRING(100),
      allowNull: false
   },
   situacao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
   },
}, 
{
 sequelize,
 modelName: 'FormaRecebimento',
 tableName: 'formasRecebimento',
 timestamps: false 
});

// relacionamentos para os includes
FormaRecebimento.belongsTo(Banco, {
   foreignKey: 'idBanco',
   as: 'banco' 
});

module.exports = FormaRecebimento;