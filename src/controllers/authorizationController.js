const { sign } = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Usuario = require('../models/Usuario');
const Authentication = require('../models/Authentication');
const sequelize = require('../database/connection');
const SimpleTtlCache = require('../utils/simpleTtlCache');

const authCache = new SimpleTtlCache(
  Number(process.env.AUTH_CACHE_TTL_MS) || 300000,
  500
);

function isTransientDatabaseError(error) {
  const errorMessage = `${error?.name || ''} ${error?.message || ''}`;

  return /SequelizeConnectionAcquireTimeoutError|SequelizeConnectionError|ETIMEDOUT|ECONNRESET|Too many connections/i.test(errorMessage);
}

module.exports = {

  async auth(req, res) {
    const { login, password } = req.body;
    const expiresIn = process.env.EXPIRES_IN;
    const timeElapsed = Date();
    const today = new Date(timeElapsed);
    
    try {
      if (!login || !password) {
        return res.status(400).send({
          error: "Invalid request",
          message: "Login e senha são obrigatórios"
        });
      }

      const usuario = await Usuario.findOne({
        where: {
          login: login,
          situacao: 1
        },
        attributes: ['idEmpresa', 'login', 'senha'],
        raw: true
      });

      if (!usuario) {
        return res.status(404).send({
          error: "User not found"
        });
      }

      const isPasswordValid = await bcrypt.compare(password, usuario.senha);
      if (!isPasswordValid) {
        return res.status(404).send({
          error: "Password not found"
        });
      }

      const authCacheKey = `empresa:${usuario.idEmpresa}`;
      let authData = authCache.get(authCacheKey);

      if (!authData) {
        authData = await Authentication.findOne({
          where: {
            idEmpresa: usuario.idEmpresa
          },
          attributes: ['username', 'user_token'],
          raw: true
        });

        if (authData) {
          authCache.set(authCacheKey, authData);
        }
      }

      if (!authData) {
        return res.status(404).send({
          error: "Authentication data not found"
        });
      }

      const token = sign({
        idEmpresa: usuario.idEmpresa,
        login: usuario.login,
        apikey: authData.user_token
      }, process.env.TOKEN_SECRET, {
        expiresIn: expiresIn,
      });

      const apiKey = `${authData.username}:${authData.user_token}`;

      return res.json({
        tokenType: "Bearer",
        token,
        apiKey,
        createdAt: today,
        expiresIn: `${expiresIn} milliseconds`
      });
    } catch (error) {
      console.error('Erro no login:', {
        login,
        error: error.message,
        pool: sequelize.getPoolStats?.()
      });

      if (isTransientDatabaseError(error)) {
        return res.status(503).send({
          error: "Database unavailable",
          message: "Banco temporariamente ocupado. Tente novamente em instantes."
        });
      }

      return res.status(500).send({
        error: "Internal Server Error",
        message: error.message
      });
    }
  }
}
