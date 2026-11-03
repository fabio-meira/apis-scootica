const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('./Empresa');
const Filial = require('./Filial');
const Vendedor = require('./Vendedor');
const MetaFilial = require('./MetaFilial');
const MetaVendedor = require('./MetaVendedor');

class MetaEmpresa extends Model {}

MetaEmpresa.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false,
 },
 startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
 },
 endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
 },
  metaEmpresa: {
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
 modelName: 'MetaEmpresa',
 tableName: 'metaEmpresas',
});

MetaEmpresa.belongsTo(Empresa, {
   foreignKey: 'idEmpresa',
   targetKey: 'idEmpresa', 
   as: 'empresa'
 });

MetaEmpresa.hasMany(MetaFilial, {
   foreignKey: 'idMetaEmpresa',
   as: 'filiais'
 });

MetaFilial.belongsTo(MetaEmpresa, {
   foreignKey: 'idMetaEmpresa',
   as: 'metaEmpresa'
 });

MetaFilial.belongsTo(Filial, {
   foreignKey: 'idFilial',
   targetKey: 'idFilial',
   as: 'filial'
 });

MetaFilial.hasMany(MetaVendedor, {
   foreignKey: 'idMetaFilial',
   as: 'vendedores'
 });

MetaVendedor.belongsTo(MetaFilial, {
   foreignKey: 'idMetaFilial',
   as: 'metaFilial'
 });

MetaVendedor.belongsTo(Vendedor, {
   foreignKey: 'idVendedor',
   as: 'vendedor'
 });

module.exports = MetaEmpresa;
