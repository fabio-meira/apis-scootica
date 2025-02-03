const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Origem extends Model {}

Origem.init({
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
 modelName: 'Origem',
 tableName: 'origem',
 timestamps: false 
});

module.exports = Origem;
