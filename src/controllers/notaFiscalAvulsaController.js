const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const NotaFiscalAvulsa = require('../models/NotaFiscalAvulsa');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Empresa = require('../models/Empresa');
const VendaProduto = require('../models/VendaProduto');
const { Op } = require('sequelize')
const sequelize = require('../database/connection');

// Função para criar uma nova fiscal avulsa e seus produtos, totais relacionados
async function postNotaAvulsa(req, res) {
    const transaction = await sequelize.transaction();
    try {
        // const notaData = req.body;
        const notaData = (req.body);
        const { idEmpresa } = req.params;

        // Adiciona idEmpresa aos dados de nota fiscal avulsa
        notaData.idEmpresa = idEmpresa;

        // Cria uma nota fiscal avulsa
        const notaAvulsa = await NotaFiscalAvulsa.create(notaData, { transaction });

        // Cria os produtos para a nota fiscal
        const produtos = notaData.produtos.map(produto => ({
            ...produto,
            idNotaAvulsa: notaAvulsa.id
        }));

        await VendaProduto.bulkCreate(produtos, { transaction });
        
        // Cria os totais com idNotaFiscalAvulsa
        const totais = {
            ...notaData.totais,
            idNotaAvulsa: notaAvulsa.id
        };
        await OrdemProdutoTotal.create(totais, { transaction });

        await transaction.commit();

        // res.status(201).json({ message: 'Nota fiscal avulsa criada com sucesso', notaData });
        res.status(201).json({
            message: 'Nota fiscal avulsa criada com sucesso',
            idNotaAvulsa: notaAvulsa.id, // 👈 Inclui o ID aqui
            notaData: {
            ...notaData,
            // idNotaAvulsa: notaAvulsa.id // 👈 Inclui também dentro do objeto notaData
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error(error);
        const statusCode = error.status || 500;
        res.status(statusCode).json({ message: error.message });
    }
}

// Função para consultar todas as notas fiscais avulsas e seus relacionamentos
async function getNotaAvulsa(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { startDate, endDate, dataEstimada, idVendedor, status, idOrdemServico, numeroOS, idVenda, 
            numeroVenda, idFilial, idNotaFiscal, idNotaFiscalIsNull, idNotaFiscalNotNull } = req.query; 

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por data de início e data de fim, se fornecidos
        if (startDate) {
            const [year, month, day] = startDate.split('-');
            const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0); 
            whereConditions.createdAt = {
                [Op.gte]: start
            };
        }
        
        if (endDate) {
            const [year, month, day] = endDate.split('-');
            const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999); 
            if (!whereConditions.createdAt) {
                whereConditions.createdAt = {};
            }
            whereConditions.createdAt[Op.lte] = end;
        }

        if (dataEstimada) {
            const [year, month, day] = dataEstimada.split('-');
        
            // Cria o início e fim do dia no horário local (GMT-3) e converte para UTC
            const start = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0));
            start.setUTCHours(start.getUTCHours() - 3); // GMT-3
        
            const end = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999));
            end.setUTCHours(end.getUTCHours() - 3); // GMT-3
        
            whereConditions.dtEstimadaEntrega = {
                [Op.between]: [start, end]
            };
        }

        // Adicione filtro por idFornecedor, se fornecido
        if (idVendedor) {
            whereConditions.idVendedor = idVendedor;
        }
        
        // Adicione filtro por status, se fornecido
        if (status) {
            whereConditions.situacao = status; 
        }

        // Adicione filtro por id venda, se fornecido
        if (idVenda) {
            whereConditions.id = idVenda; 
        }

        // Adicione filtro por filial, se fornecido
        if (idFilial) {
            whereConditions.idFilial = idFilial;
        }

        // Filtro de nota fiscal
        if (idNotaFiscal) {
            // Se o valor for um número, filtra por ID específico
            whereConditions.idNotaFiscal = idNotaFiscal;
        } else if (idNotaFiscalIsNull === 'true') {
            // Se for string 'true' (vindo da query), filtra notas não emitidas
            whereConditions.idNotaFiscal = { [Op.is]: null };
        } else if (idNotaFiscalNotNull === 'true') {
            // Se for string 'true' (vindo da query), filtra notas emitidas
            whereConditions.idNotaFiscal = { [Op.not]: null };
        }

        const notaAvulsa = await NotaFiscalAvulsa.findAll({
            where: whereConditions,
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
                {
                    model: Cliente,
                    as: 'cliente'
                },
                {
                    model: Vendedor,
                    as: 'vendedor'
                },
                {
                    model: VendaProduto,
                    as: 'produtos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });
        if (!notaAvulsa) {
            return res.status(404).json({ message: 'Nenhuma nota fiscal avulsa localizada' });
        }
        res.status(200).json(notaAvulsa);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar nota fiscal avulsa', error });
    }
}

// Função para buscar por um Id de nota fiscal avulsa
async function getIdNotaAvulsa(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;

        const notaAvulsa = await NotaFiscalAvulsa.findOne({
            where: { idEmpresa: idEmpresa,
                id: id
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'ie', 'razaoSocial', 'nomeFantasia', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'codCidade', 'estado', 'uf', 'codUF', 'telefone', 'celular']
                },
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['cpf', 'nomeCompleto', 'rg', 'dtNascimento', 'celular', 'email', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado']
                },
                {
                    model: Vendedor,
                    as: 'vendedor'
                },
                {
                    model: VendaProduto,
                    as: 'produtos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!notaAvulsa) {
            return res.status(404).json({ message: 'Nota fiscal avulsa não encontrada' });
        }

        // // Garante que haja um array de pagamentos
        // const pagamentos = venda.pagamentos || [];

        // // Soma os pagamentos adiantados
        // const valorAdiantamento = pagamentos
        // .filter(p => p.adiantamento === true)
        // .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);

        // // Soma os pagamentos não adiantados
        // const valorPagoVenda = pagamentos
        // .filter(p => p.adiantamento === false)
        // .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
        
        // const output = {
        //     ...venda.toJSON(),
        //     valorAdiantamento,
        //     valorPagoVenda
        // };
      
        return res.status(200).json(output);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar uma nota fiscal avulsa', error });
    }
}


// Função para deletar uma nota fiscal avulsa pelo id
async function deleteNotaAvulsa(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a nota fsical avulsa no banco de dados
        const deleted = await NotaFiscalAvulsa.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Nota fiscal Aaulsa deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Nota fiscal avulsa não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar nota fiscal avulsa', error });
    }
}

module.exports = {
    postNotaAvulsa,
    getNotaAvulsa,
    getIdNotaAvulsa,
    deleteNotaAvulsa 
};