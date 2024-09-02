const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Categoria = require('./Categoria');

class PlanoConta extends Model {}

PlanoConta.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idEmpresa: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
 modelName: 'PlanoConta',
 tableName: 'planoConta',
 timestamps: false 
});

// relacionamentos para os includes
PlanoConta.belongsTo(Categoria, {
   foreignKey: 'idCategoria',
   as: 'categoria' 
});

module.exports = PlanoConta;
