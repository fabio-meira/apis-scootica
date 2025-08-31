const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class NotaFiscal extends Model {}

NotaFiscal.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.INTEGER(100),
    allowNull: true,
 },
 idVenda: {
   type: DataTypes.INTEGER,
   allowNull: true
},
tipo: {
    type: DataTypes.ENUM('NFC-e', 'NF-e'),
    allowNull: false
},
 chave: {
    type: DataTypes.STRING(255),
    allowNull: true
 },
 protocolo: {
    type: DataTypes.STRING(255),
    allowNull: true
 },
 xml: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
 },
danfePath: {
    type: DataTypes.STRING(255),
    allowNull: true
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
 modelName: 'NotaFiscal',
 tableName: 'notasFiscais',
});

module.exports = NotaFiscal;
