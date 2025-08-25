const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Parcela extends Model {}

Parcela.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idEmpresa: {
        type: DataTypes.STRING(50),
        allowNull: true,
   },
   idFilial: {
    type: DataTypes.INTEGER,
    allowNull: true,
   },
   idPagamento: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   tipoPagamento: {
     type: DataTypes.ENUM('Credito', 'Debito', 'Boleto', 'Duplicata', 'Crediario', 'Pix'), 
     allowNull: false
   },
   quantidade: {
     type: DataTypes.INTEGER,
     allowNull: true,
   },
   valorParcela: {
    type: DataTypes.DECIMAL(9,2),
    allowNull: true
   },
   percJuros: {
    type: DataTypes.DECIMAL(5,2),
    allowNull: true
   },
   dataVencimento: {
      type: DataTypes.DATE,
      allowNull: true,
   },
   outrasInformacoes: {
      type: DataTypes.STRING(1000),
      allowNull: false,
   },
    createdAt: {
    type: DataTypes.DATE,
    allowNull: true
   },
   updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
   }
}, 
{
 sequelize,
 modelName: 'Parcela',
 tableName: 'parcelas'
});

module.exports = Parcela;
