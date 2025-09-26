const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class PipelineStatus extends Model {}

PipelineStatus.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 statuses_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
 },
 pipeline_id: {
    type: DataTypes.BIGINT,
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
 is_editable: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
 },
 type: {
    type: DataTypes.INTEGER,
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
 modelName: 'PipelineStatus',
 tableName: 'pipelineStatuses',
});

module.exports = PipelineStatus;