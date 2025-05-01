const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('./Empresa');
const Produto = require('./Produto');

class Reserva extends Model {}

Reserva.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
 },
 idOrdemServico: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 idVenda: {
   type: DataTypes.INTEGER,
   allowNull: true
},
 idProduto: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 quantidade: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 situacao: {
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
 modelName: 'Reserva',
 tableName: 'reservas',
});

Reserva.belongsTo(Empresa, {
   foreignKey: 'idEmpresa',
   targetKey: 'idEmpresa', 
   as: 'empresa'
 });

 Reserva.belongsTo(Produto, {
    foreignKey: 'idProduto',
    targetKey: 'id', 
    as: 'produto'
  });

module.exports = Reserva;
