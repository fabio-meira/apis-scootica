const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Meta extends Model {}

Meta.init({
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
 },
 idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false,
 },
 idFilial: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 idVendedor: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 tipo: {
    type: DataTypes.ENUM('Faturamento', 'Vendas', 'NovosClientes', 'ProdutosPremium', 'Outros'),
    allowNull: false
 },
 descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
 },
 periodo: {
   type: DataTypes.ENUM('Mensal', 'Quadrimestral', 'Semestral', 'Anual'),
   allowNull: false
 },
 ano: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 mes: {
    type: DataTypes.INTEGER,
    allowNull: true,
 },
 quadrimestre: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
 },
 semestre: {
   type: DataTypes.BOOLEAN,
   allowNull: true,
},
 valorMeta: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
 },
  valorRealizado: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
 },
 status: {
   type: DataTypes.ENUM('EmAndamento', 'Concluida', 'Atrasada'),
   allowNull: false
 },
 observacoes: {
    type: DataTypes.TEXT,
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
 modelName: 'Meta',
 tableName: 'metas',
});

module.exports = Meta;
