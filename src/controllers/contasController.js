const Caixa = require('../models/Caixa');
const Cliente = require('../models/Cliente');
const Conta = require('../models/Conta');
const Fornecedor = require('../models/Fornecedores');
const PlanoConta = require('../models/PlanoConta');

// Função para cadastrar nova conta
async function postConta(req, res) {
    try {
        const contaData = req.body;
        const { idEmpresa } = req.params; 

        // Adiciona o idEmpresa como idEmpresa no objeto contaData
        contaData.idEmpresa = idEmpresa;

        // Identificar o idFilial para consulta do próximo número venda
        const idFilial = contaData.idFilial;

        // Consulta o último registro na tabela caixa
        const ultimoCaixa = await Caixa.findOne({
            where: { idEmpresa, idFilial }, 
            order: [['createdAt', 'DESC']], 
        });

        // Verifica se o último caixa encontrado tem a situação igual a 1 (caixa aberto)
        if (!ultimoCaixa || ultimoCaixa.situacao !== 1) {
            return res.status(422).json({ message: 'Não é possível cadastrar a conta. O caixa está fechado.' });
        }

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

        // Substituir fornecedor com valores padrão se ele for null
        // if (!conta.fornecedor && conta.idFornecedor === null) {
        //     conta.fornecedor = {
        //         razaoSocial: "Sem fornecedor",
        //         nomeFantasia: "Sem fornecedor",
        //         cnpj: "99999999999999",
        //         celular: "(99) 9999-9999"
        //     };
        // }

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