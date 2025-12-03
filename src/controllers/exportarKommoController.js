const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Empresa = require('../models/Empresa');
const OrdemServico = require('../models/OrdemServico');
const { Op, EmptyResultError } = require('sequelize')
const sequelize = require('../database/connection');
const { criarContatoNoKommo, criarVendaNoKommo, avancarKanbanKommo, criarOrdemServicoNoKommo, criarOrcamentoNoKommo, criarExameVistaNoKommo } = require("../services/kommoService");
const VendaProduto = require('../models/VendaProduto');
const OrdemProduto = require('../models/OrdemProduto');
const OrdemProdutoTotal = require('../models/OrdemProdutoTotal');
const Receita = require('../models/Receita');
const Medico = require('../models/Medico');

async function postVendaKommo(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const { idEmpresa } = req.params;

        // Buscar empresa
        const empresa = await Empresa.findOne({
            where: { idEmpresa },
            transaction
        });

        if (!empresa) {
            await transaction.rollback();
            return res.status(404).json({ message: "Empresa não encontrada" });
        }

        // Buscar venda pendente de integração
        const vendaData = await Venda.findOne({
            where: {
                idEmpresa,
                integradoCRM: 0,
                idLead: null
            },
            transaction
        });

        if (!vendaData) {
            await transaction.commit();
            return res.status(404).json({ message: "Nenhuma venda pendente de integração" });
        }

        // Buscar cliente
        const cliente = await Cliente.findOne({
            where: { idEmpresa, id: vendaData.idCliente },
            transaction
        });

        if (!cliente) {
            await transaction.rollback();
            return res.status(404).json({ message: "Cliente não encontrado" });
        }

        // Buscar vendedor
        const vendedor = await Vendedor.findOne({
            where: { idEmpresa, id: vendaData.idVendedor },
            transaction
        });

        if (!vendedor) {
            await transaction.rollback();
            return res.status(404).json({ message: "Vendedor não encontrado" });
        }

        // Buscar produtos
        const produtos = await VendaProduto.findAll({
            where: { idVenda: vendaData.id },
            transaction
        });

        if (!produtos || produtos.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ message: "Produtos não encontrados" });
        }

        // Buscar totais
        const totais = await OrdemProdutoTotal.findOne({
            where: { idVenda: vendaData.id },
            transaction
        });

        if (!totais) {
            await transaction.rollback();
            return res.status(404).json({ message: "Totais não encontrados" });
        }

        // Ordem de serviço (opcional)
        let idLead = null;
        let type = 3;

        if (vendaData.idOrdemServico) {
            const os = await OrdemServico.findOne({
                where: { idEmpresa, id: vendaData.idOrdemServico },
                transaction
            });
            idLead = os?.idLead || null;
        }

        // INTEGRAÇÃO CRM
        try {
            // Criar contato no CRM
            if (!cliente.exportado || !cliente.idCRM) {
                const contatoKommo = await criarContatoNoKommo(
                    idEmpresa,
                    vendaData.idFilial,
                    cliente,
                    empresa
                );

                const idCRM = contatoKommo?._embedded?.contacts?.[0]?.id;
                if (idCRM) {
                    await cliente.update({ idCRM, exportado: true }, { transaction });
                }
            }

            // Criar venda no CRM
            if (!vendaData.idOrdemServico) {
                // Criar lead
                const vendaKommo = await criarVendaNoKommo(
                    idEmpresa,
                    vendaData.idFilial,
                    vendaData,
                    cliente,
                    vendedor,
                    produtos,
                    totais
                );

                idLead = vendaKommo?.[0]?.id || null;

            } else {
                // Avançar Kanban
                const kanban = await avancarKanbanKommo(
                    idEmpresa,
                    vendaData.idFilial,
                    idLead,
                    type
                );

                idLead = kanban?.id || idLead;
            }

            // Atualizar venda no banco
            if (idLead) {
                await Venda.update(
                    { idLead, integradoCRM: true },
                    { where: { id: vendaData.id, idEmpresa }, transaction }
                );
            }

        } catch (kommoErr) {
            console.error("Kommo Error:", kommoErr.response?.data || kommoErr.message);
            await transaction.rollback();
            return res.status(500).json({
                message: "Erro na integração da venda com o Kommo",
                error: kommoErr.response?.data || kommoErr.message
        });
        }

        await transaction.commit();

        return res.status(200).json({
            message: "Integração de venda com o Kommo concluída",
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

async function postOSKommo(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { idEmpresa } = req.params;
    
    // Buscar empresa
    const empresa = await Empresa.findOne({
      where: { idEmpresa },
      transaction
    });

    if (!empresa) {
      throw new Error("Empresa não encontrada");
    }

    // Pegar OS pendente
    const ordemServicoData = await OrdemServico.findOne({
      where: {
        idEmpresa,
        integradoCRM: 0,
        idLead: null
      },
      transaction
    });

    if (!ordemServicoData) {
      await transaction.commit();
      return res.status(404).json({
        message: "Nenhuma ordem de serviço pendente de integração"
      });
    }

    // Buscar cliente
    const cliente = await Cliente.findOne({
      where: {
        idEmpresa,
        id: ordemServicoData.idCliente
      },
      transaction
    });

    if (!cliente) throw new Error("Cliente da O.S. não encontrado");

    // Buscar vendedor
    const vendedor = await Vendedor.findOne({
      where: {
        idEmpresa,
        id: ordemServicoData.idVendedor
      },
      transaction
    });

    if (!vendedor) throw new Error("Vendedor da O.S. não encontrado");

    // Buscar produtos
    const produtos = await OrdemProduto.findAll({
      where: { idOrdemServico: ordemServicoData.id },
      transaction
    });

    if (!produtos || produtos.length === 0) {
      throw new Error("Nenhum produto vinculado à O.S.");
    }

    // Buscar totais
    const totais = await OrdemProdutoTotal.findOne({
      where: { idOrdemServico: ordemServicoData.id },
      transaction
    });

    if (!totais) {
      throw new Error("Totais da O.S. não encontrados");
    }

    // console.log("PRODUTOS:", produtos.map(p => p.descricao));
    // console.log("TOTAL:", totais.total ?? "sem total");

    // Buscar orçamento
    let or = null;
    let idLead = null;
    const type = 2;

    if (ordemServicoData.idOrcamento) {
      or = await Orcamento.findOne({
        where: {
          idEmpresa,
          id: ordemServicoData.idOrcamento
        },
        transaction
      });

      if (or?.idLead) {
        idLead = or.idLead;
      }
    }

    // Integração com Kommo
    try {
      // Exportar cliente se necessário
      if (!cliente.exportado || !cliente.idCRM) {
        const contatoKommo = await criarContatoNoKommo(
          idEmpresa,
          ordemServicoData.idFilial,
          cliente,
          empresa
        );

        const idCRM = contatoKommo?._embedded?.contacts?.[0]?.id;

        if (!idCRM) {
          throw new Error("Kommo retornou contato sem idCRM");
        }

        await cliente.update(
          { idCRM, exportado: true },
          { transaction }
        );
      }

      // Criar OS no Kommo se não tiver orçamento
      if (!ordemServicoData.idOrcamento) {
        const osKommo = await criarOrdemServicoNoKommo(
          idEmpresa,
          ordemServicoData.idFilial,
          ordemServicoData,
          cliente,
          vendedor,
          produtos,
          totais
        );

        if (!osKommo || !Array.isArray(osKommo) || !osKommo[0]?.id) {
          throw new Error("Kommo não retornou ID válido ao criar a O.S.");
        }

        idLead = osKommo[0].id;
      }
      // Ou só avança kanban
      else {
        const kanbanResponse = await avancarKanbanKommo(
          idEmpresa,
          ordemServicoData.idFilial,
          idLead,
          type
        );

        idLead = kanbanResponse?.id || idLead;

        if (!idLead) {
          throw new Error("Kommo falhou ao avançar Kanban — idLead indefinido");
        }
      }

      // Atualizar OS com idLead
      await OrdemServico.update(
        { idLead, integradoCRM: true },
        {
          where: { id: ordemServicoData.id, idEmpresa: idEmpresa },
          transaction
        }
      );

    } catch (kommoErr) {
      console.error("Kommo Error:", kommoErr.response?.data || kommoErr.message);
      await transaction.rollback();
      return res.status(500).json({
        message: "Erro na integração de ordem de seviço com o Kommo",
        error: kommoErr.response?.data || kommoErr.message
      });
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Integração de ordem de serviço concluída com sucesso",
      idLead: idLead || null
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Erro geral:", err.message);

    return res.status(500).json({
      message: "Erro na integração de O.S. com Kommo",
      error: err.message
    });
  }
}

async function postEVKommo(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { idEmpresa } = req.params;

    let idLead = null;
    
    // Buscar empresa
    const empresa = await Empresa.findOne({
      where: { idEmpresa },
      transaction
    });

    if (!empresa) {
        await transaction.rollback();
        return res.status(404).json({ message: "Empresa não encontrado" });
    }

    // Pegar receita pendente
    const receitaData = await Receita.findOne({
      where: {
        idEmpresa,
        integradoCRM: 0,
        idLead: null
      },
      transaction
    });
    
    if (!receitaData) {
        await transaction.commit();
        return res.status(404).json({ message: "Nenhuma receita pendente de integração" });
    }

    // Buscar cliente
    const cliente = await Cliente.findOne({
      where: {
        idEmpresa,
        id: receitaData.idCliente
      },
      transaction
    });

    if (!cliente) {
        await transaction.rollback();
        return res.status(404).json({ message: "Cliente não encontrado" });
    }

    // Buscar médico antes de criar mensagem
    const medico = await Medico.findOne({
        where: { idEmpresa: idEmpresa,
            id: receitaData.idMedico
            },
            transaction
    });

    if (!medico) {
        await transaction.rollback();
        return res.status(404).json({ message: "Médico não encontrado" });
    }

    // let idLead = null;

    // Integração com Kommo
    try {
        // Exportar cliente se necessário
        if (!cliente.exportado || !cliente.idCRM) {
            const contatoKommo = await criarContatoNoKommo(
                idEmpresa,
                receitaData.idFilial,
                cliente,
                empresa
            );

            const idCRM = contatoKommo?._embedded?.contacts?.[0]?.id;

            if (!idCRM) {
                throw new Error("Kommo retornou contato sem idCRM");
            }

            await cliente.update(
                { idCRM, exportado: true },
                { transaction }
            );
        }

        // Criar exame de vista no Kommo se não tiver orçamento
        const exameVistaKommo = await criarExameVistaNoKommo(
            idEmpresa,
            receitaData.idFilial,                     
            receitaData,                
            cliente,   
            medico
        );
        // Extrai o id retornado pelo Kommo
        const idLead = exameVistaKommo?.[0]?.id;

        if (idLead) {
            // Atualiza receita com idCRM e marca exportado = true
            await receitaData.update(
                { idLead: idLead, integradoCRM: true },
                { where: { id: receitaData.id, idEmpresa: idEmpresa },
                    transaction 
                }
            );
                    
            receitaData.dataValues.kommoResponse = exameVistaKommo;
        }
    } catch (kommoErr) {
      console.error("Kommo Error:", kommoErr.response?.data || kommoErr.message);
      await transaction.rollback();
      return res.status(500).json({
        message: "Erro na integração da receita com o Kommo",
        error: kommoErr.response?.data || kommoErr.message
      });
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Integração da receita concluída com sucesso",
      idLead: receitaData.idLead || null
    });

  } catch (err) {
    await transaction.rollback();
    console.error("Erro geral:", err.message);

    return res.status(500).json({
      message: "Erro na integração da receita com Kommo",
      error: err.message
    });
  }
}

module.exports = {
    postVendaKommo,
    postOSKommo,
    postEVKommo
};