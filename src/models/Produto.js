// models/Produto.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const MarcaProduto = require('./MarcaProduto');
const GrupoProduto = require('./GrupoProduto');
const ColecaoProduto = require('./ColecaoProduto');
const SubGrupoProduto = require('./SubGrupoProduto');
const Fornecedor = require('./Fornecedores');
// const OrdemProduto = require('./OrdemProduto');

class Produto extends Model {}

Produto.init({
   id: {
     type: DataTypes.INTEGER,
     allowNull: false,
     primaryKey: true,
     autoIncrement: true
   },
   idEmpresa: {
     type: DataTypes.STRING(100),
     allowNull: true
   },
   idFornecedor: {
     type: DataTypes.STRING(14),
     allowNull: true
   },
   referencia: {
     type: DataTypes.STRING(55),
     allowNull: true
   },
   descricao: {
     type: DataTypes.STRING(1000),
     allowNull: true
   },
   codigoBarras: {
     type: DataTypes.STRING(15),
     allowNull: true
   },
   precoCusto: {
     type: DataTypes.DECIMAL(5, 2),
     allowNull: true
   },
   preco: {
     type: DataTypes.DECIMAL(5, 2),
     allowNull: true
   },
   precoLucro: {
     type: DataTypes.DECIMAL(5, 2),
     allowNull: true
   },
   estoque: {
     type: DataTypes.INTEGER,
     allowNull: true
   },
   estoqueMinimo: {
     type: DataTypes.INTEGER,
     allowNull: true
   },
   localizacao: {
    type: DataTypes.STRING(1000),
    allowNull: true
   },
   movimentaEstoque: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
   },
   tipoProduto: {
    type: DataTypes.STRING(50),
     allowNull: true
   },
   unidadeMedida: {
     type: DataTypes.STRING(20),
     allowNull: true
   },
   idGrupo: {
     type: DataTypes.INTEGER,
     allowNull: true
   },
   idSubGrupo: {
     type: DataTypes.INTEGER,
     allowNull: true
   },
   idMarca: {
     type: DataTypes.INTEGER,
     allowNull: true
   },
   marca: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
   ncm: {
     type: DataTypes.STRING(100),
     allowNull: true
   },
   idColecao: {
     type: DataTypes.INTEGER,
     allowNull: true
   },
   rotulo: {
     type: DataTypes.STRING(500),
     allowNull: true
   },
   lente: {
     type: DataTypes.BOOLEAN,
     allowNull: false,
     defaultValue: false
   },
   esfericoMax: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   cilindricoMax: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   adicaoMax: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   esfericoMin: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   cilindricoMin: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   adicaoMin: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   altura: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   diametro: {
    type: DataTypes.STRING(10),
    allowNull: true
   },
   ativo: {
     type: DataTypes.BOOLEAN,
     allowNull: false,
     defaultValue: true
   },
   observacoes: {
     type: DataTypes.STRING(1000),
     allowNull: true
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
   modelName: 'Produto',
   tableName: 'produtos'
 });
 
// relacionamentos para os includes
Produto.belongsTo(MarcaProduto, {
   foreignKey: 'idMarca',
   as: 'marcaProdutos' 
});

Produto.belongsTo(GrupoProduto, {
  foreignKey: 'idGrupo',
  as: 'grupoProdutos' 
});

Produto.belongsTo(SubGrupoProduto, {
  foreignKey: 'idSubGrupo',
  as: 'subGrupoProdutos' 
});

Produto.belongsTo(ColecaoProduto, {
  foreignKey: 'idColecao',
  as: 'colecaoProdutos' 
});

Produto.belongsTo(Fornecedor, {
  foreignKey: 'idFornecedor',
  as: 'fornecedores' 
});

module.exports = Produto;