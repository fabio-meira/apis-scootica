const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Banco = require('./Banco');
const ParametroJuros = require('./parametrosJuros');

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
   codigoTipoRecebimento: {
    type: DataTypes.STRING(100),
      allowNull: false
   },
   situacao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
   },
   createdAt: {
    type: DataTypes.DATE,
    allowNull: true
   },
   updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
   },
}, 
{
 sequelize,
 modelName: 'FormaRecebimento',
 tableName: 'formasRecebimento'
});

// relacionamentos para os includes
FormaRecebimento.belongsTo(Banco, {
   foreignKey: 'idBanco',
   as: 'banco' 
});

// relacionamentos para os includes
FormaRecebimento.hasMany(ParametroJuros, {
   foreignKey: 'idFormaRecebimento',
   as: 'parametrosJuros' 
});

module.exports = FormaRecebimento;