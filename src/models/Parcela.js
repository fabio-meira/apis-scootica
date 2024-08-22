const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Parcela extends Model {}

Parcela.init({
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   idContas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    },
   idEmpresa: {
        type: DataTypes.STRING(50),
        allowNull: true,
   },
   idFornecedor: {
    type: DataTypes.STRING(100),
    allowNull: true,
   },
   quantidade: {
     type: DataTypes.INTEGER,
     allowNull: true,
   },
   dataVencimento: {
      type: DataTypes.DATE,
      allowNull: true,
   },
   outrasInformacoes: {
      type: DataTypes.STRING(1000),
      allowNull: false,
   },
   statusRecebimento: {
      type: DataTypes.ENUM('Credito', 'Debito', 'Boleto', 'Duplicata'),
      allowNull: false
   },
}, 
{
 sequelize,
 modelName: 'Parcela',
 tableName: 'parcelas',
 timestamps: false 
});

module.exports = Parcela;
