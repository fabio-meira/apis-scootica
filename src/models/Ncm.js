const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Ncm extends Model {}

Ncm.init({
   Codigo: {
      type: DataTypes.STRING(20),
      primaryKey: true,
      autoIncrement: true,
   },
   Descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
   },
   Data_Inicio: {
      type: DataTypes.DATE,
      allowNull: false,
   },
   Data_Fim: {
      type: DataTypes.DATE,
      allowNull: true,
   },
   Tipo_Ato_Ini: {
      type: DataTypes.STRING(1000),
      allowNull: false,
   },
   Numero_Ato_Ini: {
      type: DataTypes.STRING(100),
      allowNull: false,
   },
   Ano_Ato_Ini: {
      type: DataTypes.STRING(100),
      allowNull: false,
   },
}, 
{
 sequelize,
 modelName: 'Ncm',
 tableName: 'ncm',
 timestamps: false 
});

module.exports = Ncm;
