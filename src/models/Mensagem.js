const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Mensagem extends Model {}

Mensagem.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
   },
   idEmpresa: {
      type: DataTypes.STRING(100),
      allowNull: false
   },
   chave: {
      type: DataTypes.STRING(500),
      allowNull: true
   },
   mensagem: {
      type: DataTypes.STRING(700),
      allowNull: false
   },
   lida: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
   },
   observacoes: {
      type: DataTypes.STRING(1000),
      allowNull: false,
   },
   createdAt: {
      type: DataTypes.DATE,
      allowNull: true
   },
   updatedAt: {
     type: DataTypes.DATE,
     allowNull: true
   }
}, 
{
 sequelize,
 modelName: 'Mensagem',
 tableName: 'mensagens'
});

module.exports = Mensagem;
