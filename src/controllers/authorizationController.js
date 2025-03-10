const express = require('express');
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Usuario = require('../models/Usuario');
const Authentication = require('../models/Authentication');
// const connection = require('../database/connection');

module.exports = {

  async auth(req, res) {
    const { login, password } = req.body;
    const expiresIn = process.env.EXPIRES_IN;
    const timeElapsed = Date();
    const today = new Date(timeElapsed);
    
    try {
      const usuario = await Usuario.findOne({
        where: {
          login: login,
          situacao: 1
        }
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

      const authData = await Authentication.findOne({
        where: {
          idEmpresa: usuario.idEmpresa
        }
      });

      if (!authData) {
        return res.status(404).send({
          error: "Authentication data not found"
        });
      }
      console.log(authData);

      const token = sign({
        idEmpresa: usuario.idEmpresa,
        login: usuario.login,
        password: usuario.senha,
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
      return res.status(500).send({
        error: "Internal Server Error"
      });
    }
  }
}
