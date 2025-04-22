const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Medico = require('../models/Medico');
const Receituario = require('../models/Receita');
const Laboratorio = require('../models/Laboratorio');
const Pagamento = require('../models/Pagamento');
const Empresa = require('../models/Empresa');
const VendaProduto = require('../models/VendaProduto');
const OrdemServico = require('../models/OrdemServico');
const { Op } = require('sequelize')
// const { format, utcToZonedTime } = require('date-fns-tz');

// Função para criar uma nova venda e seus produtos, ordem de serviço, totais e pagamentos relacionados
async function postVenda(req, res) {
    try {
        const vendaData = req.body;
        const { idEmpresa } = req.params;

        // Adiciona idEmpresa aos dados de venda
        vendaData.idEmpresa = idEmpresa;

        // Cria uma venda
        const venda = await Venda.create(vendaData);

        // Cria os produtos com idVenda
        const produtos = vendaData.produtos.map(produto => ({
            ...produto,
            idVenda: venda.id
        }));
        await VendaProduto.bulkCreate(produtos);
        
        // Cria os totais com idVenda
        const totais = {
            ...vendaData.totais,
            idVenda: venda.id
        };
        await OrdemProdutoTotal.create(totais);

        // Prepara os dados dos pagamentos
        for (const pagamento of vendaData.pagamentos) {
            // Verifica se já existe um registro de adiantamento
            const existingPayment = await Pagamento.findOne({
                where: {
                    idOrdemServico: pagamento.idOrdemServico || null,
                    idVenda: null,
                    adiantamento: true
                }
            });

            if (existingPayment) {
                // Atualiza o registro existente com idVenda
                existingPayment.idVenda = venda.id;
                await existingPayment.save();
            } else {
                // Prepara o novo pagamento com idVenda
                const newPayment = {
                    ...pagamento,
                    idVenda: venda.id,
                    idEmpresa: venda.idEmpresa
                };
                // Cria o novo pagamento
                await Pagamento.create(newPayment);
            }
        }
        
        // Verifica se a ordem de serviço existe
        const existOrdemServico = await OrdemServico.findOne({
            where: { id: vendaData.idOrdemServico || null}
        });

        // Atualiza a tabela OrdemServico no campo idVenda
        if(existOrdemServico) {
            await OrdemServico.update(
                { idVenda: venda.id,
                  situacao: 1
                },
                { where: { id: vendaData.idOrdemServico } }
            );
        }

        res.status(201).json({ message: 'Venda criada com sucesso', vendaData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao criar venda', error });
    }
}

// Função para consultar todas as vendas e seus relacionamentos
async function getVenda(req, res) {
    try {
        const { idEmpresa } = req.params;
        const { startDate, endDate, dataEstimada, idVendedor, status, idOrdemServico, idVenda } = req.query; 

        // Construa o objeto de filtro
        const whereConditions = {
            idEmpresa: idEmpresa
        };

        // Adicione filtro por data de início e data de fim, se fornecidos
        if (startDate) {
            whereConditions.createdAt = {
                [Op.gte]: new Date(startDate) 
            };
        }

        if (endDate) {
            if (!whereConditions.createdAt) {
                whereConditions.createdAt = {};
            }
            whereConditions.createdAt[Op.lte] = new Date(endDate); 
        }

        // Adicione filtro por status, se fornecido
        if (dataEstimada) {
            // Cria um objeto Date no horário local
            const date = new Date(`${dataEstimada}`);
        
            // Formata a data e hora no formato local
            const ano = date.getFullYear();
            const mes = String(date.getMonth() + 1).padStart(2, '0');
            const dia = String(date.getDate()).padStart(2, '0');
            const hora = '21';
            const minutos = '00';
            const segundos = '00';
        
            // Converte para o formato YYYY-MM-DD HH:MM:SS no horário local
            const dataEstimadaFormatada = `${ano}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;
        
            // Define o filtro para a consulta
            whereConditions.dtEstimadaEntrega = dataEstimadaFormatada;
        }

        // Adicione filtro por idFornecedor, se fornecido
        if (idVendedor) {
            whereConditions.idVendedor = idVendedor;
        }
        
        // Adicione filtro por status, se fornecido
        if (status) {
            whereConditions.situacao = status; 
        }

        // Adicione filtro por ordem de servico, se fornecido
        if (idOrdemServico) {
            whereConditions.idOrdemServico = idOrdemServico; 
        }

        // Adicione filtro por venda, se fornecido
        if (idVenda) {
            whereConditions.id = idVenda; 
        }

        const venda = await Venda.findAll({
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
                    model: Receituario,
                    as: 'receita',
                    include: [
                        {
                            model: Medico,
                            as: 'medico'
                        }
                    ]
                },
                {
                    model: Laboratorio,
                    as: 'laboratorio'
                },
                {
                    model: VendaProduto,
                    as: 'produtos'
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
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
        if (!venda) {
            return res.status(404).json({ message: 'Nenhuma venda localizada' });
        }
        res.status(200).json(venda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar vendas', error });
    }
}

// Função para buscar por um Id de venda
async function getIdVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;
        const venda = await Venda.findOne({
            where: { idEmpresa: idEmpresa,
                id: id
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'telefone', 'celular']
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
                    model: Receituario,
                    as: 'receita',
                    include: [
                        {
                            model: Medico,
                            as: 'medico'
                        }
                    ]
                },
                {
                    model: Laboratorio,
                    as: 'laboratorio'
                },
                {
                    model: VendaProduto,
                    as: 'produtos'
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
                },
                {
                    model: OrdemProdutoTotal,
                    as: 'totais'
                },
                {
                    model: OrdemServico,
                    as: 'ordemServico',
                    attributes: ['createdAt']
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!venda) {
            return res.status(404).json({ message: 'Venda não encontrada' });
        }

        // Garante que haja um array de pagamentos
        const pagamentos = venda.pagamentos || [];

        // Soma os pagamentos adiantados
        const valorAdiantamento = pagamentos
        .filter(p => p.adiantamento === true)
        .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);

        // Soma os pagamentos não adiantados
        const valorPagoVenda = pagamentos
        .filter(p => p.adiantamento === false)
        .reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
        
        const output = {
            ...venda.toJSON(),
            valorAdiantamento,
            valorPagoVenda
        };
      
        return res.status(200).json(output);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar uma venda', error });
    }
}

// Função para buscar por vendas associadas a um idCaixa
async function getCaixaIdVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params;
        const venda = await Venda.findAll({
            where: { idEmpresa: idEmpresa,
                idCaixa: id
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['cnpj', 'nome'] 
                },
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['nome'] 
                },
                {
                    model: Pagamento,
                    as: 'pagamentos'
                },
            ],
            order: [
                ['id', 'DESC']
            ]
        });

        if (!venda) {
            return res.status(404).json({ message: 'Venda não encontrada' });
        }
        
        res.status(200).json(venda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar uma venda', error });
    }
}

// Função para atualizar uma venda pelo Id
async function putVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const vendaData = req.body; 

        // Atualiza a venda no banco de dados
        const [updated] = await Venda.update(vendaData, {
            where: { 
                id: id,
                idEmpresa: idEmpresa
            }
        });

        if (updated) {
            // Busca a venda atualizada para retornar na resposta
            const venda = await Venda.findOne({ where: { id: id, idEmpresa: idEmpresa } });
            res.status(200).json({ message: 'Venda atualizada com sucesso', venda });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Venda não encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar venda', error });
    }
}

// Função para deletar uma venda pelo id
async function deleteVenda(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta a venda no banco de dados
        const deleted = await Venda.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id 
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Venda deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Venda não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar venda', error });
    }
}

module.exports = {
    postVenda,
    getVenda,
    getIdVenda,
    getCaixaIdVenda,
    putVenda,
    deleteVenda 
};