const Empresa = require('../models/Empresa');
const { Medico, Receita, Cliente } = require('../models/Association');
const Vendedor = require('../models/Vendedor');
const Mensagem = require('../models/Mensagem');
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../database/connection');
const moment = require('moment');
const { criarExameVistaNoKommo } = require("../services/kommoService");

// Função para cadastrar um nova receita
async function postReceita(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const receitaData = req.body;
        const { idEmpresa } = req.params; 

        // Adiciona o idEmpresa no objeto clienteData
        receitaData.idEmpresa = idEmpresa;
        receitaData.ativo = true;

        const receita = await Receita.create(receitaData);

        // Tenta criar a mensagem, mas se der erro não bloqueia a receita

        // Buscar médico antes de criar mensagem
        const medico = await Medico.findOne({
            where: { idEmpresa: idEmpresa,
                id: receitaData.idMedico
              },
              transaction
        });

        try {
            await Mensagem.create({
                idEmpresa: idEmpresa, 
                chave: `Receita`,
                mensagem: `Receita do profissional ${medico.nomeCompleto ?? 'desconhecido'} está pronta para impressão.`,
                lida: false,
                observacoes: `Receita para orçamento do cliente ${medico.nomeCompleto ?? 'desconhecido'}.`
            });
        } catch (msgError) {
            console.error("Erro ao criar mensagem:", msgError);
            // aqui você pode até salvar um log, mas segue o fluxo
        }

        // Integração com Kommo CRM - exame de vista como um novo orçamento sem valor
        
        // Buscar empresa antes de validar integracaoCRM
        const empresa = await Empresa.findOne({
            where: { idEmpresa: idEmpresa },
            transaction
        });

        // Buscar cliente antes de validar integracaoCRM
        const cliente = await Cliente.findOne({
            where: { idEmpresa: idEmpresa,
                id: receitaData.idCliente
              },
              transaction
        });

        // // Buscar vendedor antes de validar integracaoCRM
        // const vendedor = await Vendedor.findOne({
        //     where: { idEmpresa: idEmpresa,
        //         id: receitaData.idVendedor
        //       },
        //       transaction
        // });

        // Cria orçamento no Kommo somente se integração CRM estiver habilitada
        try {
            if (empresa.integracaoCRM === true) {

                const idFilial = receitaData.idFilial; 
                
                const exameVistaKommo = await criarExameVistaNoKommo(
                    idEmpresa,
                    idFilial,                     
                    receitaData,                
                    cliente,   
                    medico
                );

                 // Extrai o id retornado pelo Kommo
                const idCRM = exameVistaKommo?.[0]?.id;
                console.log('idCRM', idCRM);

                if (idCRM) {
                    // Atualiza receita com idCRM e marca exportado = true
                    await receita.update(
                        { idLead: idCRM, integradoCRM: true },
                        { 
                            where: { 
                                id: receita.id,        
                                idEmpresa: idEmpresa 
                            },
                            transaction 
                        }
                    );
                            
                    receita.dataValues.kommoResponse = exameVistaKommo;
                }
            }
        } catch (kommoErr) {
            console.error("Erro ao criar orçamento no Kommo:", kommoErr.response?.data || kommoErr.message);
        }

        await transaction.commit();
        res.status(201).json({ message: 'Receituário cadastrado com sucesso', receita });
    } catch (error) {
        console.error(error);
        await transaction.rollback();
        res.status(500).json({ message: 'Erro ao cadastrar receituário', error });
    }
}

// função para consulta por todos os receitas da empresa
async function listReceitas(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { startDate, endDate, status } = req.query; 

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por data de início e data de fim, se fornecidos
        if (startDate) {
            whereConditions.dtReceita = {
                [Op.gte]: new Date(startDate) // Maior ou igual à data de início
            };
        }

        if (endDate) {
            if (!whereConditions.dtReceita) {
                whereConditions.dtReceita = {};
            }
            whereConditions.dtReceita[Op.lte] = new Date(endDate); // Menor ou igual à data de fim
        }

        // Adicione filtro por status, se fornecido
        if (status) {
            whereConditions.ativo = status === 'ativo' ? 1 : 0; // Ajuste conforme sua lógica de status
        }

        const receita = await Receita.findAll({
            where: whereConditions,
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'apelido', 'registro', 'celular', 'email'] 
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
                    attributes: ['nomeCompleto', 'cpf', 'apelido', 'registro', 'celular', 'email'] 
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
                    attributes: ['nomeCompleto', 'cpf', 'apelido', 'registro', 'celular', 'email'] 
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
                    attributes: ['nomeCompleto', 'cpf', 'apelido', 'registro', 'celular', 'email'] 
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
        const { idFilial } = req.query;
        
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

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
        }

        // Buscar clientes da empresa
        const receitas = await Receita.findAll({
            where: whereConditions,
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']  
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'apelido', 'registro', 'celular', 'email'] 
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
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'uf', 'telefone', 'celular']
                },
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']   
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'apelido','registro', 'celular', 'email'] 
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
                    attributes: ['nomeCompleto', 'cpf', 'apelido', 'registro', 'celular', 'email'] 
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
        const { startDate, endDate } = req.query;

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa,
            idMedico: idMedico
        };

        // Filtro por data da receita
        if (startDate) {
            const [year, month, day] = startDate.split('-');
            const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0); 
            whereConditions.dtReceita = {
                [Op.gte]: start
            };
        }
        
        if (endDate) {
            const [year, month, day] = endDate.split('-');
            const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999); 
            if (!whereConditions.dtReceita) {
                whereConditions.dtReceita = {};
            }
            whereConditions.dtReceita[Op.lte] = end;
        }

        const receita = await Receita.findAll({
            where: whereConditions,
            include: [
                { 
                    model: Cliente, 
                    as: 'paciente',
                    attributes: ['nomeCompleto', 'cpf', 'dtNascimento', 'celular', 'email']   
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nomeCompleto', 'cpf', 'apelido', 'registro', 'celular', 'email'] 
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