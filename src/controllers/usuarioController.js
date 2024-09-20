const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const Empresa = require('../models/Empresa');
const Auth = require('../models/Authentication');

async function postUsuario(req, res) {
    try {
        const usuarioData = req.body;
        const { idEmpresa } = req.params; 
        const { email, nome, senha } = req.body;

        const usuarioExists = await Usuario.findOne({ 
            where: { 
                email: email,
                nome: nome,
                idEmpresa: idEmpresa 
            } 
        });

        if (usuarioExists) {
            return res.status(400).json({
                error: "Usuário já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa ao objeto usuarioData
        usuarioData.idEmpresa = idEmpresa;

        // Criptografa a senha antes de salvar no banco de dados
        const saltRounds = 10; // Define o número de rounds para gerar o salt
        const hashedPassword = await bcrypt.hash(senha, saltRounds);

        // Substitui a senha não criptografada pela senha criptografada
        usuarioData.senha = hashedPassword;

        const usuario = await Usuario.create(usuarioData);

        res.status(201).json({ message: 'Usuário cadastrado com sucesso', usuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário', error });
    }
}

// função para consulta por todos os usuários da empresa
async function listUsuarios(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const usuario = await Usuario.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuário', error });
    }
}

// Função para consulta de usuário por login (email)
async function loginUsuario(req, res) {
    try {
        const { id } = req.params;
        // const { idEmpresa } = req.params; 
        const usuario = await Usuario.findOne({
            where: { 
                // idEmpresa: idEmpresa,
                login: id 
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
                {
                    model: Auth,
                    as: 'token',
                    attributes: ['user_token'] 
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuário', error });
    }
}

// Função para consulta de usuário por login (email)
async function getUsuario(req, res) {
    try {
        const { id } = req.params;
        const { idEmpresa } = req.params; 
        const usuario = await Usuario.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuário', error });
    }
}

// Função para atualizar um usuário por login
async function putUsuario(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const usuarioData = req.body; 

        // Verifica se a senha foi fornecida para criptografia
        if (usuarioData.senha) {
            // Criptografa a senha antes de salvar no banco de dados
            const saltRounds = 10; // Define o número de rounds para gerar o salt
            const hashedPassword = await bcrypt.hash(usuarioData.senha, saltRounds);
            // Substitui a senha não criptografada pela senha criptografada
            usuarioData.senha = hashedPassword;
        }

        // Atualiza o usuário no banco de dados
        const [updated] = await Usuario.update(usuarioData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o usuário atualizado para retornar na resposta
            const usuario = await Usuario.findOne({ where: { idEmpresa, id } });
            res.status(200).json({ message: 'Usuário atualizado com sucesso', usuario });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar usuário', error });
    }
}

// Função para deletar um usuário pelo login
async function deletarUsuario(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o produto no banco de dados
        const deleted = await Usuario.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Usuário deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Usuário não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar usuário', error });
    }
}

module.exports = {
    postUsuario,
    listUsuarios,
    loginUsuario,
    getUsuario,
    putUsuario,
    deletarUsuario
};
