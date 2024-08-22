const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const { getAttributes } = require('./Cliente');
const Categoria = require('./Categoria');

class getPlanoConta extends Model {}

getPlanoConta.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idCategoria: {
    type: DataTypes.INTEGER,
    allowNull: true,
   },
   descricao: {
      type: DataTypes.STRING(500),
      allowNull: true,
   },
}, 
{
 sequelize,
 modelName: 'getPlanoConta',
 tableName: 'planoConta',
 timestamps: false 
});

// relacionamentos para os includes
getPlanoConta.belongsTo(Categoria, {
    foreignKey: 'idCategoria',
    as: 'categoria',
    attributes: ['descricao'] 
 });

module.exports = getPlanoConta;
