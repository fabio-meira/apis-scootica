const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Categoria extends Model {}

Categoria.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idEmpresa: {
        type: DataTypes.STRING(50),
        allowNull: true,
   },
   descricao: {
    type: DataTypes.STRING(500),
    allowNull: true,
   },
}, 
{
 sequelize,
 modelName: 'Categoria',
 tableName: 'categoria',
 timestamps: false 
});

module.exports = Categoria;
