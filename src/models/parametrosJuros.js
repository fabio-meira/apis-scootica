const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class parametrosJuros extends Model {}

parametrosJuros.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false,
 },
 idFormaRecebimento: {
   type: DataTypes.INTEGER,
   allowNull: false,
 },
 quantidadeParcelas: {
    type: DataTypes.INTEGER,
    allowNull: false,
 },
 jurosMensal: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
 },
 ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
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
 modelName: 'parametrosJuros',
 tableName: 'parametrosJuros',
});

module.exports = parametrosJuros;
