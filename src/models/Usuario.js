// models/Usuario.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('../models/Empresa');
const Auth = require('../models/Authentication');

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
   defaultValue: false
},
 permissoes: {
   type: DataTypes.JSON,
   allowNull: true,
},
idMedico: {
   type: DataTypes.STRING(100),
   allowNull: true,
},
recovery_token: {
   type: DataTypes.STRING(2000),
   allowNull: true,
},
recovery_token_expiration: {
   type: DataTypes.STRING(20),
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

Usuario.belongsTo(Auth, {
   foreignKey: 'idEmpresa',
   targetKey: 'idEmpresa', 
   as: 'token'
 });
module.exports = Usuario;
