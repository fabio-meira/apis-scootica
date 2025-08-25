const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class parcelasCrediario extends Model {}

Crediario.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 idCrediario: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 numeroParcela: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 vencimento: {
    type: DataTypes.DATE,
    allowNull: true,
 },
 valor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
 },
 pago: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
 },
 dataPagamento: {
    type: DataTypes.DATE,
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
}, {
 sequelize,
 modelName: 'parcelasCrediario',
 tableName: 'parcelasCrediario',
});

module.exports = parcelasCrediario;
