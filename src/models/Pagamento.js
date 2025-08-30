// models/Pagemento.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
// const Venda = require('../models/Venda');

class Pagamento extends Model {}

Pagamento.init({
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
 idOrcamento: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 idVenda: {
   type: DataTypes.INTEGER,
   allowNull: true
},
 tipo: {
   type: DataTypes.STRING(500),
   allowNull: true
},
tipoRecebimento: {
   type: DataTypes.STRING(100),
   allowNull: false
},
adiantamento: {
   type: DataTypes.BOOLEAN,
   allowNull: false
  },
 numeroCartao: {
    type: DataTypes.STRING(20),
    allowNull: true
 },
 bandeiraCartao: {
    type: DataTypes.STRING(16),
    allowNull: true
 },
 numeroPagamento: {
    type: DataTypes.STRING(50),
    allowNull: true
 },
 parcelas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
 },
 valorParcela: {
    type: DataTypes.DECIMAL(9,2),
    allowNull: true
 },
 valor: {
    type: DataTypes.DECIMAL(9,2),
    allowNull: true
 },
 tid: {
   type: DataTypes.STRING(30),
   allowNull: true
},
 nsu: {
    type: DataTypes.STRING(30),
    allowNull: true
 },
 codigoAutorizacao: {
    type: DataTypes.STRING(30),
    allowNull: true
 },
 dataVencimentoBoleto: {
    type: DataTypes.DATE,
    allowNull: true
 },
 voucher: {
    type: DataTypes.STRING(100),
    allowNull: true
 },
 qrCodePIX: {
    type: DataTypes.STRING(500),
    allowNull: true
 },
 transacaoPix: {
    type: DataTypes.STRING(100),
    allowNull: true
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
 modelName: 'Pagamento',
 tableName: 'pagamentos'
});

// Pagamento.belongsTo(Venda, {
//     foreignKey: 'idVenda',
//     as: 'venda'
//   });

// models/OrdemServico.js
// Pagamento.belongsTo(OrdemServico, {
//    foreignKey: 'idOrdemServico',
//    as: 'pagamentos' 
// });

module.exports = Pagamento;
