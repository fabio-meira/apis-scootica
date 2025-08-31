const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class CertificadoDigital extends Model {}

CertificadoDigital.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.INTEGER(100),
    allowNull: false,
 },
 cnpj: {
   type: DataTypes.STRING(14),
   allowNull: false
},
certBase64: {
type: DataTypes.TEXT('long'),
allowNull: true,
},
 certPass: {
    type: DataTypes.STRING(255),
    allowNull: true
 },
ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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
 modelName: 'CertificadoDigital',
 tableName: 'certificadoDigital',
});

module.exports = CertificadoDigital;
