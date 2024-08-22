const Cliente = require('../models/Cliente');
const Medico = require('../models/Medico');
const Receita = require('../models/Receita');
const { Op, fn, col, literal } = require('sequelize');
const moment = require('moment');

// Função para cadastrar um nova receita
async function postReceita(req, res) {
    try {
        const receitaData = req.body;
        const { idEmpresa } = req.params; 

        // Adiciona o idEmpresa no objeto clienteData
        receitaData.idEmpresa = idEmpresa;
        receitaData.ativo = true;

        const receita = await Receita.create(receitaData);

        res.status(201).json({ message: 'Receituário cadastrado com sucesso', receita });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar receituário', error });
    }
}

// função para consulta por todos os receitas da empresa
async function listReceitas(req, res) {
    try {
        const { idEmpresa } = req.params; 

        const receita = await Receita.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(receita);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receitas', error });
    }
}

// Função para retornar as receitas que vão vencer nos próximos 7 dias
async function listReceitaAniversario(req, res) {
    try {
        const { idEmpresa } = req.params;

        // Obter a data atual e a data de 7 dias a partir de agora
        const today = moment().startOf('day');
        const sevenDaysFromNow = moment().add(7, 'days').endOf('day');

        // Obter o mês e dia atual para comparar com o aniversário
        const todayMonthDay = today.format('MM-DD');
        const sevenDaysMonthDay = sevenDaysFromNow.format('MM-DD');

        const receitas = await Receita.findAll({
            where: {
                idEmpresa,
                // Filtrar clientes cujo aniversário está dentro dos próximos 7 dias
                [Op.and]: [
                    // Comparar mês e dia do aniversário com o intervalo
                    literal(`DATE_FORMAT(dtReceita, '%m-%d') BETWEEN '${todayMonthDay}' AND '${sevenDaysMonthDay}'`)
                ]
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
            order: [
                [fn('DATE_FORMAT', col('dtReceita'), '%m-%d'), 'ASC'] // Ordenar pelo mês e dia do aniversário da receita
            ]
        });

        // Processar os resultados para retornar a quantidade e os detalhes
        const result = {
            quantidade: receitas.length,
            receitas: receitas.map(receita => ({
                dtReceita: receita.dtReceita,
                paciente: {
                    nomeCompleto: receita.paciente.nomeCompleto,
                    cpf: receita.paciente.cpf,
                    dtNascimento: receita.paciente.dtNascimento,
                    celular: receita.paciente.celular,
                    email: receita.paciente.email
                },
                medico: {
                    nomeCompleto: receita.medico.nomeCompleto,
                    cpf: receita.medico.cpf,
                    registro: receita.medico.registro,
                    celular: receita.medico.celular,
                    email: receita.medico.email
                }
            }))
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receitas', error });
    }
}

// Função para retornar as receitas que vão vencer nos próximos 7 dias
async function listReceitaAniversarioHoje(req, res) {
    try {
        const { idEmpresa } = req.params;

        // Obter a data atual e a data de 7 dias a partir de agora
        const today = moment().startOf('day');

        // Obter o mês e dia atual para comparar com o aniversário
        const todayMonthDay = today.format('MM-DD');

        const receitas = await Receita.findAll({
            where: {
                idEmpresa,
                // Filtrar clientes cujo aniversário está dentro dos próximos 7 dias
                [Op.and]: [
                    // Comparar mês e dia do aniversário com o intervalo
                    literal(`DATE_FORMAT(dtReceita, '%m-%d') = '${todayMonthDay}'`)
                ]
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
            order: [
                [fn('DATE_FORMAT', col('dtReceita'), '%m-%d'), 'ASC'] // Ordenar pelo mês e dia do aniversário da receita
            ]
        });

        // Processar os resultados para retornar a quantidade e os detalhes
        const result = {
            quantidade: receitas.length,
            receitas: receitas.map(receita => ({
                dtReceita: receita.dtReceita,
                paciente: {
                    nomeCompleto: receita.paciente.nomeCompleto,
                    cpf: receita.paciente.cpf,
                    dtNascimento: receita.paciente.dtNascimento,
                    celular: receita.paciente.celular,
                    email: receita.paciente.email
                },
                medico: {
                    nomeCompleto: receita.medico.nomeCompleto,
                    cpf: receita.medico.cpf,
                    registro: receita.medico.registro,
                    celular: receita.medico.celular,
                    email: receita.medico.email
                }
            }))
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receitas', error });
    }
}

// Função para listar os aniversariantes de um mês o corrente e um escolhido por paramntro
async function listAniversarioMes(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { search, month } = req.query;

        let whereClause = { idEmpresa };

        if (search) {
            whereClause.dtReceita = { [Op.like]: `%${search}%` };
        }

        // Calcular o intervalo de datas para o mês corrente ou o mês especificado
        const currentYear = moment().year();
        const monthToCheck = month ? parseInt(month, 10) : moment().month() + 1; // Mês é 1-based em moment
        const startDate = moment(`${currentYear}-${monthToCheck}-01`).startOf('month');
        const endDate = moment(startDate).endOf('month');

        const receitas = await Receita.findAll({
            where: {
                ...whereClause,
                // Comparar mês e dia do aniversário com o intervalo do mês selecionado
                [Op.and]: [
                    literal(`DATE_FORMAT(dtReceita, '%m') = ${monthToCheck}`),
                    literal(`DATE_FORMAT(dtReceita, '%d') BETWEEN ${startDate.format('DD')} AND ${endDate.format('DD')}`)
                ],
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
            order: [
                [fn('DATE_FORMAT', col('dtReceita'), '%m-%d'), 'ASC'] // Ordenar pelo mês e dia do aniversário
            ]
        });

        const result = {
            quantidade: receitas.length,
            receitas: receitas.map(receita => ({
                dtReceita: receita.dtReceita,
                paciente: {
                    nomeCompleto: receita.paciente.nomeCompleto,
                    cpf: receita.paciente.cpf,
                    dtNascimento: receita.paciente.dtNascimento,
                    celular: receita.paciente.celular,
                    email: receita.paciente.email
                },
                medico: {
                    nomeCompleto: receita.medico.nomeCompleto,
                    cpf: receita.medico.cpf,
                    registro: receita.medico.registro,
                    celular: receita.medico.celular,
                    email: receita.medico.email
                }
            }))
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receitas aniversariantes', error });
    }
}

// Função para listar os aniversariantes do ano
async function listAniversarioAno(req, res) {
    try {
        const { idEmpresa } = req.params;
        
        // Definir a estrutura para armazenar os resultados
        const resultados = {
            '01': { quantidade: 0, clientes: [] },
            '02': { quantidade: 0, clientes: [] },
            '03': { quantidade: 0, clientes: [] },
            '04': { quantidade: 0, clientes: [] },
            '05': { quantidade: 0, clientes: [] },
            '06': { quantidade: 0, clientes: [] },
            '07': { quantidade: 0, clientes: [] },
            '08': { quantidade: 0, clientes: [] },
            '09': { quantidade: 0, clientes: [] },
            '10': { quantidade: 0, clientes: [] },
            '11': { quantidade: 0, clientes: [] },
            '12': { quantidade: 0, clientes: [] },
        };

        // Buscar clientes da empresa
        const receitas = await Receita.findAll({
            where: { idEmpresa },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ]
        });

        // Processar os resultados para agrupar por mês
        receitas.forEach(receita => {
            const mes = moment(receita.dtReceita).format('MM');

            if (resultados[mes]) {
                resultados[mes].quantidade += 1;
                resultados[mes].clientes.push({
                    dtReceita: receita.dtReceita,
                    paciente: {
                        nomeCompleto: receita.paciente.nomeCompleto,
                        cpf: receita.paciente.cpf,
                        dtNascimento: receita.paciente.dtNascimento,
                        celular: receita.paciente.celular,
                        email: receita.paciente.email
                    },
                    medico: {
                        nomeCompleto: receita.medico.nomeCompleto,
                        cpf: receita.medico.cpf,
                        registro: receita.medico.registro,
                        celular: receita.medico.celular,
                        email: receita.medico.email
                    }
                });
            }
        });

        // Responder com os resultados
        res.status(200).json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receitas aniversariantes', error });
    }
}

// Função para consulta de receita pelo paciente
async function getReceita(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const receita = await Receita.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']   
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ]
        });

        if (!receita) {
            return res.status(404).json({ message: 'Receita não encontrada' });
        }

        res.status(200).json(receita);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receita', error });
    }
}

// Função para consulta de receita pelo paciente
async function getReceitaPaciente(req, res) {
    try {
        const { idCliente } = req.params; 
        const { idEmpresa } = req.params; 

        const receita = await Receita.findAll({
            where: { 
                idEmpresa: idEmpresa,
                idCliente: idCliente
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']   
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!receita) {
            return res.status(404).json({ message: 'Receita não encontrada' });
        }

        res.status(200).json(receita);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receita', error });
    }
}

// Função para consulta de receitas por cpf do médico
async function getReceitaMedico(req, res) {
    try {
        const { idMedico } = req.params; 
        const { idEmpresa } = req.params; 

        const receita = await Receita.findAll({
            where: { 
                idEmpresa: idEmpresa,
                idMedico: idMedico
            },
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']   
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'registro', 'celular', 'email'] 
                }
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!receita) {
            return res.status(404).json({ message: 'Receita não encontrada' });
        }

        res.status(200).json(receita);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar receita', error });
    }
}

// Função para atualizar uma receita
async function putReceita(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const receitaData = req.body; 

        // Atualiza a receita no banco de dados
        const [updated] = await Receita.update(receitaData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca a receita atualizado para retornar na resposta
            const receita = await Receita.findByPk(id);
            res.status(200).json({ message: 'Receita atualizada com sucesso', receita });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Receita não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar receita', error });
    }
}

// Função para deletar um receita por id
async function deleteReceita(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o receita no banco de dados
        const deleted = await Receita.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Receita deletada com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Receita não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar receita', error });
    }
}

module.exports = {
    postReceita,
    listReceitas,
    listReceitaAniversario,
    listReceitaAniversarioHoje,
    listAniversarioMes,
    listAniversarioAno,
    getReceita,
    getReceitaPaciente,
    getReceitaMedico,
    putReceita,
    deleteReceita
};