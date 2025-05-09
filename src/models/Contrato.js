const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('./Empresa');

class Contrato extends Model {}

Contrato.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  nome: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  dtRegistro: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  avaliacao: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  fimAvaliacao: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  diaGerarPagamento: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  dtPagamento: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  boletoEnviado: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  tipoPagamento: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  pagamentoConfirmado: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  possuiFilial: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  percentualDesconto: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  codigoPlano: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  descricaoPlano: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  valorPlano: {
    type: DataTypes.DECIMAL(7, 2),
    allowNull: true,
  },
  valorFaturado: {
    type: DataTypes.DECIMAL(7, 2),
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, 
{
    sequelize,
    modelName: 'Contrato',
    tableName: 'contratos',
    timestamps: false 
});

// relacionamentos para os includes
Contrato.belongsTo(Empresa, {
    foreignKey: 'idEmpresa',
    as: 'empresa' 
 });

module.exports = Contrato;
