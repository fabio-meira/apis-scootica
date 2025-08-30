const { Medico, Receita, Cliente } = require('../models/Association');
const Empresa = require('../models/Empresa');
const { Op } = require('sequelize');

// Função para cadastrar um novo médico
async function postMedico(req, res) {
    try {
        const medicoData = req.body;
        const { idEmpresa } = req.params; 
        const { cpf } = req.body; 

        // Veridicar se médico já está cadastrado
        const medicoExists = await Medico.findOne({ 
            where: { 
                cpf: cpf,
                idEmpresa: idEmpresa 
            } 
        });

        if (medicoExists) {
            return res.status(400).json({
                error: "Médico já cadastrado no sistema"
            });
        }

        // Adiciona o cpf como idMedico no objeto medicoData
        medicoData.idMedico = medicoData.cpf;
        medicoData.idEmpresa = idEmpresa;

        const medico = await Medico.create(medicoData);

        res.status(201).json({ message: 'Médico cadastrado com sucesso', medico });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar médico', error });
    }
}

// função para consulta por todos os médicos da empresa
async function listMedicos(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const medicos = await Medico.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(medicos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar médicos', error });
    }
}

// Função para consulta de médico por cpf
async function getMedico(req, res) {
    try {
        const { cpf } = req.params; 
        const { idEmpresa } = req.params; 
        const medico = await Medico.findOne({
            where: { 
                idEmpresa: idEmpresa,
                cpf: cpf 
            }
        });

        if (!medico) {
            return res.status(404).json({ message: 'Médico não encontrado' });
        }

        res.status(200).json(medico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar médico', error });
    }
}

// Função para consulta de médico por id
async function getIdMedico(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const medico = await Medico.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!medico) {
            return res.status(404).json({ message: 'Médico não encontrado' });
        }

        res.status(200).json(medico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar médico', error });
    }
}

// Consultar receitas associadas a um médico
async function getIdMedicoReceitas(req, res) {
    try {
        const { id, idEmpresa } = req.params; 
        const { startDate, endDate } = req.query;

        // Filtro de data dentro da associação de Receita
        const receitaWhere = {};

        if (startDate) {
            receitaWhere.dtReceita = { [Op.gte]: new Date(startDate) };
        }

        if (endDate) {
            receitaWhere.dtReceita = receitaWhere.dtReceita || {};
            receitaWhere.dtReceita[Op.lte] = new Date(endDate);
        }

        const medico = await Medico.findOne({
            where: { id, idEmpresa },
            attributes: ['id', 'nomeCompleto', 'registro', 'email', 'celular'],
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'uf', 'telefone', 'celular']
                },
                {
                    model: Receita,
                    as: 'receitas',
                    attributes: ['id', 'dtReceita', 'ativo'],
                    required: false,
                    where: Object.keys(receitaWhere).length > 0 ? receitaWhere : undefined,
                    include: [
                        {
                            model: Cliente,
                            as: 'paciente',
                            attributes: ['id', 'nomeCompleto', 'celular', 'email'],
                        }
                    ]
                }
            ],
            order: [[{ model: Receita, as: 'receitas' }, 'dtReceita', 'DESC']]
        });

        if (!medico) {
            return res.status(404).json({ message: 'Médico não encontrado' });
        }

        res.status(200).json(medico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar médico', error });
    }
}

// Função para atualizar um médico por cpf
async function putMedico(req, res) {
    try {
        const { cpf } = req.params; 
        const { idEmpresa } = req.params; 
        const medicoData = req.body; 

        // Atualiza o médico no banco de dados
        const [updated] = await Medico.update(medicoData, {
            where: { 
                idEmpresa: idEmpresa,
                cpf: cpf 
            }
        });

        if (updated) {
            // Busca o médico atualizado para retornar na resposta
            const medico = await Medico.findByPk(cpf);
            res.status(200).json({ message: 'Médico atualizado com sucesso', medico });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Médico não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar médico', error });
    }
}

// Função para atualizar um médico por id
async function putIdMedico(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const medicoData = req.body; 

        // Atualiza o médico no banco de dados
        const [updated] = await Medico.update(medicoData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o médico atualizado para retornar na resposta
            const medico = await Medico.findByPk(id);
            res.status(200).json({ message: 'Médico atualizado com sucesso', medico });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Médico não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar médico', error });
    }
}

// Função para deletar um médico pelo CPF
async function deleteMedico(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o médico no banco de dados
        const deleted = await Medico.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Médico deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Médico não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar médico', error });
    }
}


module.exports = {
    postMedico,
    listMedicos,
    getMedico,
    getIdMedico,
    getIdMedicoReceitas,
    putMedico,
    putIdMedico,
    deleteMedico
};