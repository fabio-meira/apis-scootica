// models/Usuario.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('../models/Empresa');

class Usuario extends Model {}

Usuario.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false,
 },
 nome: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 login: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 senha: {
    type: DataTypes.STRING(200),
    allowNull: true,
 },
 email: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 tipo: {
   type: DataTypes.INTEGER,
   allowNull: true,
},
 situacao: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
 },
 admin: {
   type: DataTypes.BOOLEAN,
   allowNull: false,
   defaultValue: true
},
 permissoes: {
   type: DataTypes.JSON,
   allowNull: true,
},
idMedico: {
   type: DataTypes.STRING(100),
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
 modelName: 'Usuario',
 tableName: 'usuarios',
});

// Relacionamentos
Usuario.belongsTo(Empresa, {
   foreignKey: 'idEmpresa',
   targetKey: 'idEmpresa', 
   as: 'empresa'
 });

module.exports = Usuario;
