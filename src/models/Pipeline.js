const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Pipeline extends Model {}

Pipeline.init({
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
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 codFilialKommo: {
    type: DataTypes.INTEGER,
    allowNull: false,
 },
 pipeline_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
 },
 responsible_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 name: {
    type: DataTypes.STRING(1000),
    allowNull: true,
 },
 sort: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 is_main: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
 },
 is_unsorted_on: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
 },
 is_archive: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
 },
 account_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
 },
 url: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: true,
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
 modelName: 'Pipeline',
 tableName: 'pipelines',
});

module.exports = Pipeline;
