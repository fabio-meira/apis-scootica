const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Cliente = require('./Cliente');
const Medico = require('./Medico');

class Receita extends Model {}

Receita.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 idCliente: {
    type: DataTypes.STRING(11),
    allowNull: true,
 },
 idMedico: {
    type: DataTypes.STRING(100),
    allowNull: true,
 },
 dtReceita: {
    type: DataTypes.DATE,
    allowNull: true,
 },
 odlEsferico: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 odlCilindrico: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 odlEixo: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 odlDNP: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 odlAltura: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 oelEsferico: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 oelCilindrico: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 oelEixo: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 oelDNP: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 oelAltura: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 odpEsferico: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 odpCilindrico: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 odpEixo: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 odpDNP: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 oepEsferico: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 oepCilindrico: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 oepEixo: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 oepDNP: {
   type: DataTypes.DECIMAL(5,2),
   allowNull: true,
 },
 adicao: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true,
 },
 observacoes: {
    type: DataTypes.STRING(1000),
    allowNull: true,
 },
 ativo: {
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
 modelName: 'Receita',
 tableName: 'receitas',
});

Receita.belongsTo(Medico, {
   foreignKey: 'idMedico',
   targetKey: 'id', 
   as: 'medico' 
 });

 Receita.belongsTo(Cliente, {
   foreignKey: 'idCliente', 
   targetKey: 'id', 
   as: 'paciente' 
});
module.exports = Receita;
