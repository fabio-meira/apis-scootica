// models/OrdemServicoArquivo.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('../models/Empresa');
const OrdemServico = require('../models/OrdemServico');

class OrdemServicoArquivo extends Model {}

OrdemServicoArquivo.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  idOrdemServico: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idVenda: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nomeArquivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  caminhoS3: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipoArquivo: {
    type: DataTypes.STRING(50),
    allowNull: true // Ex: image/jpeg, application/pdf
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'OrdemServicoArquivo',
  tableName: 'ordemServicoArquivo'
});

// Relacionamentos
OrdemServicoArquivo.belongsTo(Empresa, {
  foreignKey: 'idEmpresa',
  targetKey: 'idEmpresa', 
  as: 'empresa'
});

module.exports = OrdemServicoArquivo;