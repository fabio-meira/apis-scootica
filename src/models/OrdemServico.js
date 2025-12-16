// models/OrdemServico.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Orcamento = require('../models/Orcamento');
const Pagamento = require('../models/Pagamento');
const OrdemProduto = require('../models/OrdemProduto');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Cliente = require('../models/Cliente');
const Laboratorio = require('../models/Laboratorio')
const Vendedor = require('./Vendedor');
const Receituario = require('./Receita');
const Empresa = require('../models/Empresa');
const OrdemServicoArquivo = require('./OrdemServicoArquivo');

class OrdemServico extends Model {}

OrdemServico.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idEmpresa: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  numeroOS: {
    type: DataTypes.INTEGER,
    allowNull: false
 },
  idCaixa: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idOrcamento: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idVenda: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idFilial: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  idCliente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idReceita: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idVendedor: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idLaboratorio: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  dtEstimadaEntrega: {
    type: DataTypes.DATE,
    allowNull: true
  },
  aro: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  ponte: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  diagonalMaior: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  verticalAro: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  enviadoLaboratorio: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  observacoesArmacao: {
   type: DataTypes.STRING(1000),
   allowNull: true
  },
  situacao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  origemVenda: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  observacoes: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  valorTotal: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
  },
  valorCaixa: {
    type: DataTypes.DECIMAL(9, 2),
    allowNull: true
  },
  idLead: {
  type: DataTypes.INTEGER,
  allowNull: true,
  },
  integradoCRM: {
   type: DataTypes.BOOLEAN,
   allowNull: true,
   defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'OrdemServico',
  tableName: 'ordemServico'
});

// Relacionamentos
OrdemServico.belongsTo(Empresa, {
  foreignKey: 'idEmpresa',
  targetKey: 'idEmpresa', 
  as: 'empresa'
});

OrdemServico.belongsTo(Orcamento, {
  foreignKey: 'idOrcamento',
  as: 'orcamento'
});

OrdemServico.hasMany(Pagamento, {
    foreignKey: 'idOrdemServico',
    as: 'pagamentos'
  });

OrdemServico.hasMany(OrdemProduto, {
  foreignKey: 'idOrdemServico',
  as: 'produtos' 
});

OrdemServico.hasOne(OrdemProdutoTotal, {
  foreignKey: 'idOrdemServico',
  as: 'totais' 
});

OrdemServico.belongsTo(Cliente, {
  foreignKey: 'idCliente',
  as: 'cliente'
});

OrdemServico.belongsTo(Vendedor, {
  foreignKey: 'idVendedor',
  as: 'vendedor'
});

OrdemServico.belongsTo(Laboratorio, {
  foreignKey: 'idLaboratorio',
  as: 'laboratorio'
});

OrdemServico.belongsTo(Receituario, {
  foreignKey: 'idReceita',
  as: 'receita' 
});  

OrdemServico.hasMany(OrdemServicoArquivo, {
  foreignKey: 'idOrdemServico',
  as: 'ordemServicoArquivo' 
});

module.exports = OrdemServico;
