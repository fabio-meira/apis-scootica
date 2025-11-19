// models/Authentication.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Empresa = require('../models/Empresa');
const Usuario = require('../models/Usuario');

class Authentication extends Model {}

Authentication.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idEmpresa: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    username: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    password: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    user_token: {
        type: DataTypes.STRING(2000),
        allowNull: true
    },
    bearer: {
        type: DataTypes.STRING(1000),
        allowNull: true
    },
    jwt_client_id: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    jwt_client_secret: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    jwt_grant_type: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    jwt_scope: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    bearer_token: {
        type: DataTypes.STRING(2000),
        allowNull: true
    }
}, 
{
    sequelize,
    modelName: 'Authentications',
    tableName: 'authentication',
    timestamps: false 
});

// Authentication.belongsTo(Empresa, {
//     foreignKey: 'idEmpresa',
//     targetKey: 'idEmpresa',
//     as: 'empresa'
// });

Authentication.hasMany(Usuario, {
    foreignKey: 'idEmpresa',
    sourceKey: 'idEmpresa',
    as: 'usuarios'
});

module.exports = Authentication;
