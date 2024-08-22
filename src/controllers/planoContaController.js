const PlanoConta = require('../models/PlanoConta');
const Categoria = require('../models/Categoria');


// Função para cadastrar um novo plano de conta
async function postPlanoConta(req, res) {
    try {
        const planoData = req.body;
        const { idEmpresa } = req.params; 
        const { descricao } = req.body; 

        // Verificar se plano de conta já está cadastrado
        const planoExists = await PlanoConta.findOne({ 
            where: { 
                descricao: descricao,
                idEmpresa: idEmpresa 
            } 
        });

        if (planoExists) {
            return res.status(400).json({
                error: "Plano de conta já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto planoData
        planoData.idEmpresa = idEmpresa;

        const planoConta = await PlanoConta.create(planoData);

        res.status(201).json({ message: 'Plano de conta cadastrado com sucesso', planoConta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar plano de conta', error });
    }
}

// função para consulta por todos os planos de conta da empresa
async function listPlanoConta(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const planoConta = await PlanoConta.findAll({
            where: { 
                idEmpresa: idEmpresa
            },
            include: [
                { 
                    model: Categoria, 
                    as: 'categoria', 
                    attributes: ['id','descricao'] 
                }
            ],
            order: [
                ['id', 'DESC']
            ] 
        });

        res.status(200).json(planoConta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar plano de conta', error });
    }
}

// Função para consulta por id de plano de conta
async function getPlanoConta(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const planoConta = await PlanoConta.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            },
            include: [
                { 
                    model: Categoria, 
                    as: 'categoria', 
                    attributes: ['id','descricao'] 
                }
            ] 
        });

        if (!planoConta) {
            return res.status(404).json({ message: 'Plano de conta não encontrado' });
        }

        res.status(200).json(planoConta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar plano de conta', error });
    }
}

// Função para atualizar um plano de conta
async function putPlanoConta(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const planoData = req.body; 

        // Atualiza o categoria no banco de dados
        const [updated] = await PlanoConta.update(planoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o plano de conta atualizado para retornar na resposta
            const planoConta = await PlanoConta.findByPk(id);
            res.status(200).json({ message: 'Plano de conta atualizado com sucesso', planoConta });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Plano de conta não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar plano de conta', error });
    }
}

// Função para deletar um plano de conta por id
async function deletePlanoConta(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o plano de conta no banco de dados
        const deleted = await PlanoConta.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Plano de conta deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Plano de conta não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar plano de conta', error });
    }
}

module.exports = {
    postPlanoConta,
    listPlanoConta,
    getPlanoConta,
    putPlanoConta,
    deletePlanoConta
};