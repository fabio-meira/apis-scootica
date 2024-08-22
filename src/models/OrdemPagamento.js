// models/OrdemPagamento.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class OrdemPagamento extends Model {}

OrdemPagamento.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
 },
 idOrdemServico: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 idOrcamento: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 tipo: {
    type: DataTypes.STRING(50),
    allowNull: true
 },
 numeroCartao: {
    type: DataTypes.STRING(16),
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
    allowNull: true
 },
 valor: {
    type: DataTypes.DECIMAL(9, 2),
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
 numeroBoleto: {
    type: DataTypes.STRING(16),
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
 qrCodePix: {
    type: DataTypes.STRING(500),
    allowNull: true
 },
 transacaoPix: {
    type: DataTypes.STRING(100),
    allowNull: true
 },
 dtCriacao: {
    type: DataTypes.DATE,
    allowNull: true
 },
 dtAtualizacao: {
    type: DataTypes.DATE,
    allowNull: true
 }
}, {
 sequelize,
 modelName: 'OrdemPagamento',
 tableName: 'ordemPagamentos'
});

module.exports = OrdemPagamento;
