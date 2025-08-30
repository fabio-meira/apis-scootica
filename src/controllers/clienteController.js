const Cliente = require('../models/Cliente');
// const { search } = require('../routes');
const { Op, fn, col, literal } = require('sequelize');
const moment = require('moment');
const Venda = require('../models/Venda');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Pagamento = require('../models/Pagamento');
const VendaProduto = require('../models/VendaProduto');
const Empresa = require('../models/Empresa');
const Vendedor = require('../models/Vendedor');

// Função para cadastrar um novo cliente
async function postCliente(req, res) {
    try {
        const clienteData = req.body;
        const { idEmpresa } = req.params; 
        const { cpf } = req.body; 

        // Verificar se cliente já está cadastrado
        const clienteExists = await Cliente.findOne({ 
            where: { 
                cpf: cpf,
                idEmpresa: idEmpresa 
            } 
        });

        if (clienteExists) {
            return res.status(400).json({
                error: "Cliente já cadastrado no sistema"
            });
        }

        // Adiciona o idEmpresa como idEmpresa no objeto clienteData
        clienteData.idEmpresa = idEmpresa;

        const cliente = await Cliente.create(clienteData);

        res.status(201).json({ message: 'Cliente cadastrado com sucesso', cliente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar cliente', error });
    }
}

// função para consulta por todos os clientes da empresa
async function listCliente(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { search } = req.query; 

        let whereClause = { idEmpresa }; // Condição padrão para filtrar pelo nome do cliente
        if (search) {
            // Se 'search' estiver presente na consulta, adicionar condição para filtrar pelo nome
            whereClause.nomeCompleto = { [Op.like]: `%${search}%` }; // Filtrar por nome que contém a substring 'search'
        }

        const cliente = await Cliente.findAll({
            where: whereClause,
            order: [
                ['id', 'DESC']
            ]
        },);

        res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar cliente', error });
    }
}

// Função para consulta de cliente por id
async function getCliente(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const cliente = await Cliente.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar cliente', error });
    }
}

// Função para consulta de cliente para procura
async function getClientes(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const { search } = req.query; 

        let whereClause = { idEmpresa }; // Condição padrão para filtrar pelo nome do cliente
        if (search) {
            // Se 'search' estiver presente na consulta, adicionar condição para filtrar pelo nome
            whereClause.nomeCompleto = { [Op.like]: `%${search}%` }; // Filtrar por nome que contém a substring 'search'
        }

        const cliente = await Cliente.findAll({
            where: whereClause,
            attributes: ['id', 'nomeCompleto']
        });

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar cliente', error });
    }
}

// Função para consulta de cliente por cpf
async function getClienteCpf(req, res) {
    try {
        const { cpf } = req.params; 
        const { idEmpresa } = req.params; 
        
        const cliente = await Cliente.findOne({
            where: { 
                idEmpresa: idEmpresa,
                cpf: cpf 
            }
        });

        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar cliente', error });
    }
}

// Função para retornar os aniversariantes nos próximos 7 dias
async function listClienteAniversario(req, res) {
    try {
        const { idEmpresa } = req.params;

        // Obter a data atual e a data de 7 dias a partir de agora
        const today = moment().startOf('day');
        const sevenDaysFromNow = moment().add(7, 'days').endOf('day');

        // Obter o mês e dia atual para comparar com o aniversário
        const todayMonthDay = today.format('MM-DD');
        const sevenDaysMonthDay = sevenDaysFromNow.format('MM-DD');

        const clientes = await Cliente.findAll({
            where: {
                idEmpresa,
                // Filtrar clientes cujo aniversário está dentro dos próximos 7 dias
                [Op.and]: [
                    // Comparar mês e dia do aniversário com o intervalo
                    literal(`DATE_FORMAT(dtNascimento, '%m-%d') BETWEEN '${todayMonthDay}' AND '${sevenDaysMonthDay}'`)
                ]
            },
            attributes: ['nomeCompleto', 'dtNascimento', 'celular', 'email'],
            order: [
                [fn('DATE_FORMAT', col('dtNascimento'), '%m-%d'), 'ASC'] // Ordenar pelo mês e dia do aniversário
            ]
        });

        res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar clientes', error });
    }
}

// Função para listar os aniversariantes de um mês o corrente e um escolhido por paramntro
async function listClienteAniversarioMes(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { search, month } = req.query;

        let whereClause = { idEmpresa };

        if (search) {
            whereClause.dtNascimento = { [Op.like]: `%${search}%` };
        }

        // Calcular o intervalo de datas para o mês corrente ou o mês especificado
        const currentYear = moment().year();
        const monthToCheck = month ? parseInt(month, 10) : moment().month() + 1; // Mês é 1-based em moment
        const startDate = moment(`${currentYear}-${monthToCheck}-01`).startOf('month');
        const endDate = moment(startDate).endOf('month');

        const clientes = await Cliente.findAll({
            where: {
                ...whereClause,
                // Comparar mês e dia do aniversário com o intervalo do mês selecionado
                [Op.and]: [
                    literal(`DATE_FORMAT(dtNascimento, '%m') = ${monthToCheck}`),
                    literal(`DATE_FORMAT(dtNascimento, '%d') BETWEEN ${startDate.format('DD')} AND ${endDate.format('DD')}`)
                ],
            },
            attributes: ['nomeCompleto', 'dtNascimento', 'celular', 'email'],
            order: [
                [fn('DATE_FORMAT', col('dtNascimento'), '%m-%d'), 'ASC'] // Ordenar pelo mês e dia do aniversário
            ]
        });

        res.status(200).json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar clientes', error });
    }
}

// Função para listar os aniversariantes do ano
async function listAniversariantesNoAno(req, res) {
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
        const clientes = await Cliente.findAll({
            where: { idEmpresa },
            attributes: ['nomeCompleto', 'dtNascimento', 'celular', 'email'],
        });

        // Processar cada cliente e contar os aniversariantes por mês
        clientes.forEach(cliente => {
            const mes = moment(cliente.dtNascimento).format('MM'); // Mês no formato '01', '02', etc.

            if (resultados[mes]) {
                resultados[mes].quantidade += 1;
                resultados[mes].clientes.push({
                    nomeCompleto: cliente.nomeCompleto,
                    dtNascimento: cliente.dtNascimento,
                    celular: cliente.celular,
                    email: cliente.email
                });
            }
        });

        // Responder com os resultados
        res.status(200).json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar aniversariantes', error });
    }
}

// Função para consulta de cliente por id
async function getClienteVendas(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        const cliente = await Cliente.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        const empresa = await Empresa.findOne({
            where: { idEmpresa: idEmpresa },
            attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'uf', 'telefone', 'celular']
        });
        
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }

        // Define a condição de busca
        let whereCondition = { idCliente: id };
        
        // Busca as vendas de cliente
        const vendas = await Venda.findAll({ 
            where: whereCondition,
            attributes: ['id', 'numeroVenda', 'idReceita', 'origemVenda', 'idVendedor', 'valorTotal', 'createdAt'],
            include: [
                {
                    model: VendaProduto,
                    as: 'produtos' ,
                    attributes: ['idProduto', 'referencia', 'quantidade', 'descricao', 'marca', 'preco', 'valorTotal', 'createdAt']
                },
                {
                    model: Pagamento,
                    as: 'pagamentos',
                    attributes: ['tipo', 'adiantamento', 'parcelas', 'valor']
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais',
                    attributes: ['totalProdutos', 'desconto', 'Percdesconto', 'acrescimo', 'frete', 'total']
                },
                {
                    model: Vendedor,
                    as: 'vendedor' ,
                    attributes: ['id', 'nomeCompleto']
                }
            ]
        });

        // Se não houver nenhum venda, retornar somente os daddos da empresa e do cliente
        if (vendas.length === 0) {
            return res.status(200).json({ 
                nomeCliente: cliente.nomeCompleto,
                telefone: cliente.celular,
                totalVendas: null,
                empresa: empresa,
                vendas: []
            });
        }    

        // calcula o valor de vendas do cliente
        let totalVendas = 0;

        const vendasCliente = vendas.map(venda => {
            totalVendas += parseFloat(venda.valorTotal || 0);
            return { ...venda.toJSON(), valorTotal: venda.valorTotal };
        });

        // Garantir duas casas decimais
        totalVendas = parseFloat(totalVendas.toFixed(2));

        res.status(200).json({ 
            nomeCliente: cliente.nomeCompleto,
            // cpf: cliente.cpf,ç
            telefone: cliente.celular,
            totalVendas,
            vendas: vendasCliente,
            empresa: empresa
        });
        // res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar cliente', error });
    }
}

// Função para atualizar um cliente
async function putCliente(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const clienteData = req.body; 

        // Atualiza o cliente no banco de dados
        const [updated] = await Cliente.update(clienteData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o cliente atualizado para retornar na resposta
            const cliente = await Cliente.findByPk(id);
            res.status(200).json({ message: 'Cliente atualizado com sucesso', cliente });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar cliente', error });
    }
}

// Função para deletar um cliente por id
async function deleteCliente(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o cliente no banco de dados
        const deleted = await Cliente.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Cliente deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Cliente não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar cliente', error });
    }
}

module.exports = {
    postCliente,
    listCliente,
    getCliente,
    getClientes,
    getClienteCpf,
    listClienteAniversario,
    listClienteAniversarioMes,
    listAniversariantesNoAno,
    getClienteVendas,
    putCliente,
    deleteCliente
};