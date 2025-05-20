const Vendedor = require('../models/Vendedor');
const Venda = require('../models/Venda');
const VendaProduto = require('../models/VendaProduto');
const { Op } = require("sequelize");
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Pagamento = require('../models/Pagamento');
const Empresa = require('../models/Empresa');
const OrdemServico = require('../models/OrdemServico');
const Orcamento = require('../models/Orcamento');

async function postVendedor(req, res) {
    try {
        const vendedorData = req.body;
        const { idEmpresa } = req.params; 
        const { cpf } = req.body; 

        const vendedorExists = await Vendedor.findOne({ 
            where: { 
                cpf: cpf,
                idEmpresa: idEmpresa 
            } 
        });

        if (vendedorExists) {
            return res.status(400).json({
                error: "Vendedor já cadastrado no sistema"
            });
        }
        
        // Adiciona o cpf como idVendedor no objeto vendedorData
        vendedorData.idMedico = vendedorData.registro;
        vendedorData.idEmpresa = idEmpresa;

        const vendedor = await Vendedor.create(vendedorData);

        res.status(201).json({ message: 'Vendedor cadastrado com sucesso', vendedor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar vendedor', error });
    }
}

async function listVendedores(req, res) {
    try {
        const { idEmpresa } = req.params; 
        const vendedor = await Vendedor.findAll({
            where: { 
                idEmpresa: idEmpresa 
            },
            order: [
                ['id', 'DESC']
            ]
        });

        res.status(200).json(vendedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar vendedores', error });
    }
}

async function getVendedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const vendedor = await Vendedor.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        res.status(200).json(vendedor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar vendedor', error });
    }
}

// Função para consultar vendedor e suas vendas por um período específico ou todos os pedidos
async function getVendasVendedor(req, res) {
    try {
        const { id, idEmpresa } = req.params;
        let { startDate, endDate } = req.query;

        // Verifica se o vendedor existe
        const vendedor = await Vendedor.findOne({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            },
            attributes: ['nomeCompleto', 'cpf', 'comissao'] 
        });

        const empresa = await Empresa.findOne({
            where: { idEmpresa: idEmpresa },
            attributes: ['cnpj', 'nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'telefone', 'celular']
        });

        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado' });
        }

        // Define a condição de busca
        let whereCondition = { idVendedor: id };

        // parametro de consulta por data inicio e final das vendas
        if (startDate) {
            const [year, month, day] = startDate.split('-');
            const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0); 
            whereCondition.createdAt = {
                [Op.gte]: start
            };
        }
        
        if (endDate) {
            const [year, month, day] = endDate.split('-');
            const end = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999); 
            if (!whereCondition.createdAt) {
                whereCondition.createdAt = {};
            }
            whereCondition.createdAt[Op.lte] = end;
        }
        
        // Busca as vendas do vendedor
        const vendas = await Venda.findAll({ 
            where: whereCondition,
            attributes: ['id', 'idCliente', 'idReceita', 'origemVenda', 'valorTotal', 'createdAt'],
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
                }
            ]
        });

        // Se não houver nenhum venda, retornar somente os daddos da empresa e do vendedor
        if (vendas.length === 0) {
            return res.status(200).json({ 
                nomeVendedor: vendedor.nomeCompleto,
                cpf: vendedor.cpf,
                totalVendas: 0,
                totalComissao: 0,
                quantidadeVendas: 0,
                ticketMedio: 0,
                empresa: empresa,
                vendas: []
            });
        }        

        // Calcula a comissão sobre cada venda 
        const taxaComissao = vendedor.comissao ? vendedor.comissao / 100 : 0;
        let totalComissao = 0;
        let totalVendas = 0;

        const vendasComComissao = vendas.map(venda => {
            const comissao = Number((parseFloat(venda.valorTotal || 0) * taxaComissao).toFixed(2));
            totalComissao += comissao;
            totalVendas += parseFloat(venda.valorTotal || 0);
            return { ...venda.toJSON(), comissao: comissao, valorTotal: venda.valorTotal };
        });

        // Garantir duas casas decimais
        totalComissao = parseFloat(totalComissao.toFixed(2));
        totalVendas = parseFloat(totalVendas.toFixed(2));

        // Cálculo do ticket médio de vendas do vendedot
        const quantidadeVendas = vendas.length;
        const ticketMedio = quantidadeVendas > 0 ? parseFloat((totalVendas / quantidadeVendas).toFixed(2)) : 0;

        res.status(200).json({ 
            nomeVendedor: vendedor.nomeCompleto,
            cpf: vendedor.cpf,
            totalVendas,
            totalComissao,
            quantidadeVendas,
            ticketMedio,
            empresa: empresa,
            vendas: vendasComComissao
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar vendas do vendedor', error });
    }
}

async function getRankingVendedores(req, res) {
  try {
    const { idEmpresa } = req.params;
    let { startDate, endDate } = req.query;

    // Converter datas para o formato Date com horários corretos
    const whereDate = {};
    if (startDate) {
      const [y, m, d] = startDate.split('-');
      whereDate[Op.gte] = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0);
    }
    if (endDate) {
      const [y, m, d] = endDate.split('-');
      whereDate[Op.lte] = new Date(Number(y), Number(m) - 1, Number(d), 23, 59, 59, 999);
    }

    // Buscar todos os vendedores da empresa
    const vendedores = await Vendedor.findAll({
      where: { idEmpresa },
      attributes: ['id', 'nomeCompleto', 'cpf']
    });

    const empresa = await Empresa.findOne({
        where: { idEmpresa: idEmpresa },
        attributes: ['nome', 'logradouro', 'numero', 'complemento', 'cep', 'bairro', 'cidade', 'estado', 'telefone', 'celular']
    });

    const ranking = [];

    for (const vendedor of vendedores) {
      // Vendas do vendedor
      const vendas = await Venda.findAll({
        where: {
          idEmpresa,
          idVendedor: vendedor.id,
          ...(startDate || endDate ? { createdAt: whereDate } : {})
        },
        attributes: ['valorTotal']
      });

      const totalVendas = vendas.reduce((acc, venda) => acc + parseFloat(venda.valorTotal || 0), 0);
      const quantidadeVendas = vendas.length;

      // Contar ordens de serviço
      const ordensServico = await OrdemServico.count({
        where: {
          idEmpresa,
          idVendedor: vendedor.id,
          ...(startDate || endDate ? { createdAt: whereDate } : {})
        }
      });

      // Contar orçamentos
      const orcamentos = await Orcamento.count({
        where: {
          idEmpresa,
          idVendedor: vendedor.id,
          ...(startDate || endDate ? { createdAt: whereDate } : {})
        }
      });

      ranking.push({
        idVendedor: vendedor.id,
        nomeVendedor: vendedor.nomeCompleto,
        cpf: vendedor.cpf,
        totalVendas: totalVendas.toFixed(2),
        quantidadeVendas,
        ordensServico,
        orcamentos
      });
    }

    // Ordenar pelo total de vendas decrescente
    ranking.sort((a, b) => parseFloat(b.totalVendas) - parseFloat(a.totalVendas));

    res.status(200).json({ 
        empresa,
        periodo: {
            inicio: startDate,
            fim: endDate,
        },
        ranking 
    });

  } catch (error) {
    console.error('Erro ao gerar ranking de vendedores:', error);
    res.status(500).json({ message: 'Erro ao gerar ranking de vendedores', error });
  }
}

async function putVendedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 
        const vendedorData = req.body; 

        // Atualiza o vendedor no banco de dados
        const [updated] = await Vendedor.update(vendedorData, {
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (updated) {
            // Busca o vendedor atualizado para retornar na resposta
            const vendedor = await Vendedor.findByPk(id);
            res.status(200).json({ message: 'Vendedor atualizado com sucesso', vendedor });
        } else {
            // Se nenhum registro foi atualizado, retorna um erro 404
            res.status(404).json({ message: 'Vendedor não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar vendedor', error });
    }
}

async function deleteVendedor(req, res) {
    try {
        const { id } = req.params; 
        const { idEmpresa } = req.params; 

        // Deleta o médico no banco de dados
        const deleted = await Vendedor.destroy({
            where: { 
                idEmpresa: idEmpresa,
                id: id
            }
        });

        if (deleted) {
            res.status(200).json({ message: 'Vendedor deletado com sucesso' });
        } else {
            // Se nenhum registro foi deletado, retorna um erro 404
            res.status(404).json({ message: 'Vendedor não encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao deletar vendedor', error });
    }
}


module.exports = {
    postVendedor,
    listVendedores,
    getVendedor,
    getVendasVendedor,
    getRankingVendedores,
    putVendedor,
    deleteVendedor
};