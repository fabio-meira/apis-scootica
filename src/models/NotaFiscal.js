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
 numeroVenda: {
   type: DataTypes.INTEGER,
   allowNull: true
},
 numeroAvulsa: {
   type: DataTypes.INTEGER,
   allowNull: true
},
 idNotaAvulsa: {
   type: DataTypes.INTEGER,
   allowNull: true
 },
 tipo: {
    type: DataTypes.ENUM('NFC-e', 'NF-e'),
    allowNull: true
},
numero: {
   type: DataTypes.INTEGER,
   allowNull: true
},
serie: {
   type: DataTypes.STRING(10),
   allowNull: true
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
 pdfBase64: {
    type: DataTypes.TEXT('long'),
    allowNull: true
 },
 danfePath: {
    type: DataTypes.STRING(255),
    allowNull: true
 },
CodStatusRespostaSefaz: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 DsStatusRespostaSefaz: {
    type: DataTypes.STRING(1000),
    allowNull: true
 },
 CodAmbiente: {
    type: DataTypes.INTEGER,
    allowNull: true
 },
 DsTipoAmbiente: {
    type: DataTypes.STRING(100),
    allowNull: true
 },
 idNuvemFiscal: {
    type: DataTypes.STRING(100),
    allowNull: true
 },
 digest_value: {
    type: DataTypes.STRING(500),
    allowNull: true
 },
 erroProcessamento: {
    type: DataTypes.TEXT,
    allowNull: true
 },
 status: {
    type: DataTypes.STRING(100),
    allowNull: true
 },
 valorNf: {
    type: DataTypes.DECIMAL(9,2),
    allowNull: true
 },
 DsMotivo: {
    type: DataTypes.TEXT,
    allowNull: true,
 },
 DsEvento: {
    type: DataTypes.TEXT,
    allowNull: true,
 },
 NumeroSequencial: {
    type: DataTypes.INTEGER,
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
 modelName: 'NotaFiscal',
 tableName: 'notasFiscais',
});

module.exports = NotaFiscal;
