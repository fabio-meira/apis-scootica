const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Cliente = require('./Cliente');
const PlanoConta = require('./PlanoConta');
const getPlanoConta = require('./getPlanoConta');
const Fornecedor = require('./Fornecedores');
const Empresa = require('./Empresa');

class Conta extends Model {}

Conta.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   numeroDocumento: {
    type: DataTypes.INTEGER,
    allowNull: true,
   },   
   idPlanoConta: {
      type: DataTypes.INTEGER,
      allowNull: true,
   },
   tipo: {
    type: DataTypes.ENUM('Pagar', 'Receber'),
    allowNull: false
   },
   idEmpresa: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   descricao: {
      type: DataTypes.STRING(1000),
      allowNull: true,
   },
   valor: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
   },
   dataVencimento: {
      type: DataTypes.DATE,
      allowNull: false,
   },
   outrasInformacoes: {
      type: DataTypes.STRING(1000),
      allowNull: true,
   },
   statusRecebimento: {
      type: DataTypes.ENUM('Pendente', 'Recebido', 'Atrasado'),
      allowNull: false
   },
   idFornecedor: {
      type: DataTypes.STRING(100),
      allowNull: true,
   },
   idCliente: {
      type: DataTypes.STRING(14),
      allowNull: true,
   },
}, 
{
 sequelize,
 modelName: 'Conta',
 tableName: 'contas',
 timestamps: false 
});

// relacionamentos para os includes
Conta.belongsTo(Cliente, {
   foreignKey: 'idCliente',
   as: 'cliente' 
});

Conta.belongsTo(PlanoConta, {
   foreignKey: 'idPlanoConta',
   as: 'planoConta' 
});

Conta.belongsTo(getPlanoConta, {
   foreignKey: 'idPlanoConta',
   as: 'getplanoConta' 
});

Conta.belongsTo(Fornecedor, {
   foreignKey: 'idFornecedor',
   as: 'fornecedor' 
});

Conta.belongsTo(Empresa, {
   foreignKey: 'idEmpresa',
   as: 'empresa' 
});

module.exports = Conta;
