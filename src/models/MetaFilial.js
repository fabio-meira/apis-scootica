const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class MetaFilial extends Model {}

MetaFilial.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idMetaEmpresa: {
    type: DataTypes.INTEGER,
    allowNull: false,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false,
 },
 idFilial: {
    type: DataTypes.STRING(15),
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
 modelName: 'MetaFilial',
 tableName: 'metaFiliais',
});

module.exports = MetaFilial;
