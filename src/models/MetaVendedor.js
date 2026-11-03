const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class MetaVendedor extends Model {}

MetaVendedor.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idMetaFilial: {
    type: DataTypes.INTEGER,
    allowNull: false,
 },
 idVendedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
 },
 meta: {
    type: DataTypes.DECIMAL(12,2),
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
 modelName: 'MetaVendedor',
 tableName: 'metaVendedores',
});

module.exports = MetaVendedor;
