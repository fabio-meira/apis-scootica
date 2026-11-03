const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Regiao extends Model {}

Regiao.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  nome: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Regiao',
  tableName: 'regioes',
});

module.exports = Regiao;
