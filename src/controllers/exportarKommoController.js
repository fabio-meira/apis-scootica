const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Empresa = require('../models/Empresa');
const OrdemServico = require('../models/OrdemServico');
const { Op } = require('sequelize')
const sequelize = require('../database/connection');
const { criarContatoNoKommo, criarVendaNoKommo, avancarKanbanKommo } = require("../services/kommoService");
const VendaProduto = require('../models/VendaProduto');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');

async function postVendaKommo(req, res) {
    const transaction = await sequelize.transaction();
    try {
        const { idEmpresa } = req.params;

        const empresa = await Empresa.findOne({
            where: { idEmpresa },
            transaction
        });

        // Buscar venda pendente de integração
        const vendaData = await Venda.findOne({
            where: { 
                idEmpresa,
                integradoCRM: 3,
                idLead: null
            },
            transaction
        });

        if (!vendaData) {
            console.log("Nenhuma venda pendente de integração");
            await transaction.commit();
            return;
        }

        // Buscar cliente
        const cliente = await Cliente.findOne({
            where: { idEmpresa, id: vendaData.idCliente },
            transaction
        });

        if (!cliente) throw new Error("Cliente não encontrado");

        // Buscar vendedor antes de validar integracaoCRM
        const vendedor = await Vendedor.findOne({
            where: { idEmpresa: idEmpresa,
                id: vendaData.idVendedor
                },
                transaction
        });

        if (!vendedor) throw new Error("Cliente não encontrado");

        // Buscar produtos
        const produtos = await VendaProduto.findAll({
            where: { idVenda: vendaData.id },
            transaction
        })

        // Buscar totais
        const totais = await OrdemProdutoTotal.findOne({
            where: { idVenda: vendaData.id },
            transaction
        })

        if (!produtos || produtos.length === 0) throw new Error("Produtos não encontrados");
        if (!totais) throw new Error("Totais não encontrados");

        console.log('total: ', totais.total);

        // Ordem de serviço
        let os = null;
        let idLead = null;
        let type = 3;

        if (vendaData.idOrdemServico) {
            os = await OrdemServico.findOne({
                where: { idEmpresa, id: vendaData.idOrdemServico },
                transaction
            });
            idLead = os?.idLead || null;
        }

        // Criar ou atualizar cliente no Kommo
        if (!cliente.exportado || !cliente.idCRM) {
            const contatoKommo = await criarContatoNoKommo(idEmpresa, vendaData.idFilial, cliente, empresa);
            const idCRM = contatoKommo?._embedded?.contacts?.[0]?.id;

            if (idCRM) {
                await cliente.update({ idCRM, exportado: true }, { transaction });
            }
        }

        // Criar ou atualizar venda no Kommo
        if (!vendaData.idOrdemServico) {
            const vendaKommo = await criarVendaNoKommo(idEmpresa, vendaData.idFilial, vendaData, cliente, vendedor, produtos, totais);
            idLead = vendaKommo?.[0]?.id || null;
        } else {
            const kanbanResponse = await avancarKanbanKommo(idEmpresa, vendaData.idFilial, idLead, type);
            idLead = kanbanResponse?.id || idLead;
        }

        // Atualiza venda com idLead e marca como integrado
        if (idLead) {
            await Venda.update(
                { idLead, integradoCRM: true },
                { where: { id: vendaData.id, idEmpresa }, transaction }
            );
        }

        await transaction.commit();
        console.log("Integração com Kommo finalizada com sucesso");
        
        return res.status(200).json({
            message: "Integração com Kommo finalizada com sucesso",
            idLead: idLead || null
        });

    } catch (err) {
        await transaction.rollback();
        console.error("Erro na integração com Kommo:", err.message);
                
        return res.status(500).json({
            message: "Erro na integração com Kommo",
            error: err.message
        });
    }
}

module.exports = {
    postVendaKommo
};