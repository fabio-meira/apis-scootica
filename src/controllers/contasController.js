const Categoria = require('../models/Categoria');
const Cliente = require('../models/Cliente');
const Conta = require('../models/Conta');
const Fornecedor = require('../models/Fornecedores');
const PlanoConta = require('../models/PlanoConta');
const getPlanoConta = require('../models/getPlanoConta')
const sequelize = require('../database/connection');

// Função para obter o próximo número de documento
const getNextAccountNumber = async () => {
    try {
        // Executar a consulta para obter o último ID
        const [rows] = await sequelize.query('SELECT id FROM contas ORDER BY id DESC LIMIT 1', { type: sequelize.QueryTypes.SELECT });

        // Adicionar log para verificar o resultado da consulta
        console.log('Resultado da consulta:', rows);

        // Verificar se a consulta retornou algum resultado
        if (rows.length > 1) {
            const lastId = rows[0].id;
            console.log('Último ID:', lastId);
            return lastId;
        } else {
            // Caso não haja nenhum registro, retornar 0 ou algum valor padrão
            return 0;
        }
    } catch (error) {
        console.error('Erro ao obter o próximo número de documento:', error);
        throw error;
    }
};

module.exports = { getNextAccountNumber };

// Função para cadastrar nova conta
async function postConta(req, res) {
    try {
        const contaData = req.body;
        const { idEmpresa } = req.params; 
        // const { numeroDocumento } = req.body;

        // Verificar se conta a pagar ou a receber já está cadastrada
        // const contaExists = await Conta.findOne({ 
        //     where: { 
        //         idEmpresa: idEmpresa,
        //         numeroDocumento: await getNextAccountNumber() 
        //     } 
        // });

        // if (contaExists) {
        //     return res.status(400).json({
        //         error: "Conta já cadastrado no sistema"
        //     });
        // }

        // Adiciona o idEmpresa como idEmpresa no objeto contaData
        contaData.idEmpresa = idEmpresa;

        // Gerar número de documento autoincremental
        contaData.numeroDocumento = await getNextAccountNumber();

        const conta = await Conta.create(contaData);

        res.status(201).json({ message: 'Conta cadastrada com sucesso', conta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar conta', error });
    }
}

// função para consulta por todas as contas da empresa
async function listConta(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const conta = await Conta.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    attributes: ['nomeCompleto', 'cpf', 'celular']  
                },
                {
                    model: PlanoConta,
                    as: 'planoConta',
                    attributes: ['descricao'] 
                },
                {
                    model: Fornecedor,
                    as: 'fornecedor',
                    attributes: ['razaoSocial', 'nomeFantasia', 'cnpj', 'celular'] 
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(conta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar conta', error });
    }
}

// Função para consulta por id de contas a pagar ou a receber
async function getConta(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const conta = await Conta.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'cliente',
                    attributes: ['nomeCompleto', 'cpf', 'celular']  
                },
                {
                    model: PlanoConta,
                    as: 'planoConta',
                    attributes: ['descricao'] 
                },
                {
                    model: Fornecedor,
                    as: 'fornecedor',
                    attributes: ['razaoSocial', 'nomeFantasia', 'cnpj', 'celular'] 
                }
            ]
        });

        if (!conta) {
            return res.status(404).json({ message: 'Conta não encontrada' });
        }

        res.status(200).json(conta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar conta', error });
    }
}

// Função para atualizar uma conta a pagar ou a receber
async function putConta(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const contaData = req.body; 

        // Atualiza a forma de recebimento no banco de dados
        const [updated] = await Conta.update(contaData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a conta atualizado para retornar na resposta
            const conta = await Conta.findByPk(id);
            res.status(200).json({ message: 'Conta atualizado com sucesso', conta });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Conta não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar conta', error });
    }
}

// Função para deletar uma conta por id
async function deleteConta(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a conta no banco de dados
        const deleted = await Conta.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Conta deletada com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Conta não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar uma conta', error });
    }
}

module.exports = {
    postConta,
    listConta,
    getConta,
    putConta,
    deleteConta
};