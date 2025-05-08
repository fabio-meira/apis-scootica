const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const Empresa = require('../models/Empresa');
const Auth = require('../models/Authentication');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Filial = require('../models/Filial');

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
        const { filiais } = req.query; 

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };
        
        // Adicione filtro por status, se fornecido
        if (filiais) {
            whereConditions.idFilial = filiais; 
        }

        const usuario = await Usuario.findAll({
            // where: { 
            //     idEmpresa: idEmpresa 
            // },
            where: whereConditions,
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
                {
                    model: Filial,
                    as: 'filial',
                    attributes: ['idFilial', 'nomeFantasia']
                }
            ],
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

// Função para consulta de usuário por login (id)
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
                    attributes: ['cnpj', 'nome', 'filiais'] 
                },
                {
                    model: Auth,
                    as: 'token',
                    attributes: ['user_token'] 
                },
                {
                    model: Filial,
                    as: 'filial',
                    attributes: ['idFilial', 'nomeFantasia']
                }
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

async function loginEmail(req, res) {
    try {
        const { email } = req.params;

        // Verificar se o e-mail existe
        const usuario = await Usuario.findOne({
            where: { email: email }
        });

        // Se o usuário não for encontrado, retornar um erro
        if (!usuario) {
            return res.status(404).json({ message: 'E-mail do usuário não encontrado' });
        }

        // Gerar um token de recuperação de senha
        const recoveryToken = crypto.randomBytes(32).toString('hex');
        const expirationTime = Date.now() + 3600000; // 1 hora para expiração
        // const expirationTime = Date.now() + 10; // 1 hora para expiração para realziar testes, deletar depois dos testes

        // Salvar o token e a expiração no banco de dados (adicione um campo no modelo de usuário ou em uma tabela separada)
        await usuario.update({
            recovery_token: recoveryToken,
            recovery_token_expiration: expirationTime
        });

        // Criar o link de recuperação de senha
        const recoveryLink = `http://localhost:3000/password/${recoveryToken}`;
        // const userEmail = process.env.EMAIL;
        // const passEmail = process.env.EMAIL_PASS;

        // Criação do transportador com as configurações do SMTP da Locaweb
        let transporter = nodemailer.createTransport({
            host: 'email-ssl.com.br',     // Servidor SMTP da Locaweb
            port: 465,                    // Porta do SMTP com TLS
            secure: true,                 // Usando TLS (não SSL)
            auth: {
            user: 'contato@fabester.com.br',  
            pass: 'Ester@21032014',           
            },
        });

        // Configurar o conteúdo do e-mail
        const mailOptions = {
            from: 'contato@fabester.com.br',
            to: usuario.email,
            subject: 'Recuperação de Senha', 
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
                    <img src="/img/optware_preto.png" alt="Optware" style="max-width: 150px; margin-bottom: 20px;">
                    <h1 style="color: #7F5539; font-size: 24px;">Optware - Software de Ótica</h1>
                    <h2 style="color: #333; font-size: 20px;">Recuperação de Senha</h2>
                    <p style="font-size: 16px; color: #555;">Olá <strong>${usuario.nome}</strong>,</p>
                    <p style="font-size: 16px; color: #555;">Para redefinir sua senha, clique no botão abaixo:</p>
                    <a href="${recoveryLink}" 
                       style="display: inline-block; padding: 12px 20px; margin: 20px 0; font-size: 16px; color: white; background-color: #7F5539; text-decoration: none; border-radius: 5px;">
                       Redefinir Senha
                    </a>
                    <p style="font-size: 14px; color: #777;">O link expirará em <strong>1 hora</strong>.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">Se você não solicitou a recuperação de senha, ignore este e-mail.</p>
                </div>
            `
        };

        // Enviar o e-mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
            return console.log('Erro ao enviar e-mail:', error);
            }
            console.log('Mensagem enviada: %s', info.messageId);
        });
        
        // Responder com sucesso
        res.status(200).json({ message: 'E-mail de recuperação enviado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao enviar e-mail de recuperação', error });
    }
}

// Função para consulta de usuário por id de usuário
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
                {
                    model: Filial,
                    as: 'filial',
                    attributes: ['idFilial', 'nomeFantasia']
                }
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

// Função para atualizar um usuário por id
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

// Função para atualizar um usuário por id
async function putSenha(req, res) {
    try {
        const { recoveryToken } = req.params; 
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
                recovery_token: recoveryToken
            }
        });

        if (updated) {
            // Busca o usuário atualizado para retornar na resposta
            const usuario = await Usuario.findOne({ where: { recovery_token: recoveryToken } });
            res.status(200).json({ message: 'Senha atualizado com sucesso', usuario });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(422).json({ message: 'Token expirado. Favor solicitar um novo' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar a senha', error });
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
    loginEmail,
    getUsuario,
    putUsuario,
    putSenha,
    deletarUsuario
};
