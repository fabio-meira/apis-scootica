const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Crediario extends Model {}

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
 idFilial: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 idVendedor: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 idCobrador: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 idParametrosJuros: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 valorTotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
 },
 parcelas: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 jurosAplicado: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
 },
 valorParcela: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
 },
 creadiarioPago: {
    type: DataTypes.BOOLEAN,
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
 modelName: 'Crediario',
 tableName: 'crediarios',
});

module.exports = Crediario;
