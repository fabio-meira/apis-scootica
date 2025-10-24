const { emitirNFe, emitirNFCe, emitirNFeAvulsa, cancelarNFe } = require('../services/emissaoService');
const Venda = require('../models/Venda');
// const { emitirNFCeViaNuvemFiscal } = require('../services/nfceNuvemFiscalService');
const Empresa = require('../models/Empresa');
const NotaFiscal = require('../models/NotaFiscal');
const NotaFiscalAvulsa = require('../models/NotaFiscalAvulsa');
const { Op } = require('sequelize');

async function emitirNotaFiscal(req, res) {
  const { idVenda } = req.body;
  const { idEmpresa } = req.params;

  try {
    // Consulta a venda com associações
    const venda = await Venda.findOne({
      where: { id: idVenda, idEmpresa },
      include: [
        { association: 'cliente' },
        { association: 'produtos' },
        { association: 'pagamentos' },
        { association: 'totais' },
        { association: 'empresa' }
      ]
    });

    if (!venda) {
      return res.status(404).json({ erro: 'Venda não encontrada' });
    }
 
    // Consulta a empresa para pegar o modelo fiscal
    const empresa = await Empresa.findOne({
      where: { idEmpresa }
    });

    // console.log('Empresa: ', empresa.tipoNF);
    if (!empresa) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }

    // Verifica o modelo fiscal (55 = NF-e, 65 = NFC-e)
    let resultado;

    if (empresa.tipoNF === 55) {
      resultado = await emitirNFe(venda, empresa);
    } else if (empresa.tipoNF === 65) {
      resultado = await emitirNFCe(venda, empresa);
    } else {
      return res.status(400).json({ erro: 'Modelo fiscal inválido (deve ser 55 ou 65)' });
    }

    // Verifica sucesso
    if (!resultado.sucesso) {
      return res.status(500).json({ erro: resultado.erro });
    }

    if(resultado.sucesso && resultado.status === 'rejeitado'){
          return res.status(422).json({
          id: resultado.id,
          chaveAcesso: resultado.chaveAcesso,
          protocolo: resultado.protocolo,
          status: resultado.status,
          autorizacao: resultado.autorizacao
        })
    }

    return res.json({
      mensagem: 'Nota fiscal emitida com sucesso',
      id: resultado.id,
      chaveAcesso: resultado.chaveAcesso,
      protocolo: resultado.protocolo,
      status: resultado.status,
      dataEmissao: resultado.dataEmissao,
      valorTotal: resultado.valorTotal,
      autorizacao: resultado.autorizacao
    });

  } catch (erro) {
    console.error('Erro no controller:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

async function emitirNotaFiscalAvulsa(req, res) {
  const { idNotaAvulsa } = req.body;
  const { idEmpresa } = req.params;

  try {
    // Consulta a venda com associações
    const notaAvulsa = await NotaFiscalAvulsa.findOne({
      where: { id: idNotaAvulsa, idEmpresa },
      include: [
        { association: 'cliente' },
        { association: 'produtos' },
        // { association: 'pagamentos' },
        { association: 'totais' },
        { association: 'empresa' }
      ]
    });

    if (!notaAvulsa) {
      return res.status(404).json({ erro: 'Nota fiscal avulsa não encontrada' });
    }
 
    // Consulta a empresa para pegar o modelo fiscal
    const empresa = await Empresa.findOne({
      where: { idEmpresa }
    });

    // console.log('Empresa: ', empresa.tipoNF);
    if (!empresa) {
      return res.status(404).json({ erro: 'Empresa não encontrada' });
    }

    // Verifica o modelo fiscal (55 = NF-e, 65 = NFC-e)
    let resultado;

    if (empresa.tipoNF === 55) {
      console.log('entrou emiirNFeAvulsa');
      resultado = await emitirNFeAvulsa(notaAvulsa, empresa);
    } else if (empresa.tipoNF === 65) {
      resultado = await emitirNFCeAvulsa(notaAvulsa, empresa);
    } else {
      return res.status(400).json({ erro: 'Modelo fiscal inválido (deve ser 55 ou 65)' });
    }

    // Verifica sucesso
    if (!resultado.sucesso) {
      return res.status(500).json({ erro: resultado.erro });
    }

    if(resultado.sucesso && resultado.status === 'rejeitado'){
          return res.status(422).json({
          id: resultado.id,
          chaveAcesso: resultado.chaveAcesso,
          protocolo: resultado.protocolo,
          status: resultado.status,
          autorizacao: resultado.autorizacao
        })
    }

    return res.json({
      mensagem: 'Nota fiscal emitida com sucesso',
      id: resultado.id,
      chaveAcesso: resultado.chaveAcesso,
      protocolo: resultado.protocolo,
      status: resultado.status,
      dataEmissao: resultado.dataEmissao,
      valorTotal: resultado.valorTotal,
      autorizacao: resultado.autorizacao
    });

  } catch (erro) {
    console.error('Erro no controller:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

async function listaNotaFiscal(req, res) {
  const { idEmpresa } = req.params;

  const { startDate, endDate, numero, CodStatusRespostaSefaz } = req.query; 

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

  // Adicione filtro por status, se fornecido
  if (numero) {
      whereConditions.numero = numero; 
  }

  // Filtro por status SEFAZ
  if (CodStatusRespostaSefaz) {
    if (CodStatusRespostaSefaz === '!=100') {
      // Rejeitada → diferente de 100
      whereConditions.CodStatusRespostaSefaz = { [Op.ne]: 100 };
    } else {
      // Autorizada → igual a 100
      whereConditions.CodStatusRespostaSefaz = Number(CodStatusRespostaSefaz);
    }
  }

  try {
    const notaFiscal = await NotaFiscal.findAll({
      // where: { idEmpresa },
      where: whereConditions,
              order: [
                ['id', 'DESC']
              ],
    });

    if (notaFiscal.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma nota fiscal encontrada' });
    }

    return res.json(notaFiscal);
  } catch (erro) {
    console.error('Erro no controller:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

async function getNotaFiscal(req, res) {
  const { idEmpresa } = req.params;
   const { idNotaFiscal } = req.params;

  try {
    const notaFiscal = await NotaFiscal.findOne({
      where: { idEmpresa: idEmpresa, 
               status: 1, 
               id: idNotaFiscal},
              order: [
                ['id', 'DESC']
              ]
    });

    if (!notaFiscal) {
      return res.status(404).json({ erro: 'Nenhuma nota fiscal encontrada' });
    }

    res.status(200).json(notaFiscal);
  } catch (erro) {
    console.error('Erro no controller:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

async function cancelarNotaFiscal(req, res) {
  const { chave } = req.body;
  const { justificativa } = req.body;
  const { idEmpresa } = req.params;

  console.log('chave: ', chave);
  console.log('emrpesa: ', idEmpresa);
  console.log('justificativa: ', justificativa);

  try {
    // Consulta a nota fiscal
    const notaFiscal = await NotaFiscal.findOne({
      where: { chave: chave, 
          idEmpresa
       },
    });

    if (!notaFiscal) {
      return res.status(404).json({ erro: 'Nota fiscal não encontrada' });
    };

    const empresa = idEmpresa;
    console.log('empresa-updt: ', empresa);

    let resultado;

    resultado = await cancelarNFe(chave, empresa, justificativa);
    
    // Verifica sucesso
    if (!resultado.sucesso) {
      return res.status(500).json({ erro: resultado.erro });
    }

    if(resultado.sucesso && resultado.status === 'rejeitado'){
          return res.status(422).json({
          id: resultado.id,
          chaveAcesso: resultado.chaveAcesso,
          protocolo: resultado.protocolo,
          status: resultado.status,
          autorizacao: resultado.autorizacao
        })
    }

    return res.json({
      mensagem: 'Nota fiscal cancelada com sucesso',
      id: resultado.id,
      // chaveAcesso: resultado.chaveAcesso,
      protocolo: resultado.protocolo,
      status: resultado.status,
      dataEmissao: resultado.dataEmissao,
      valorTotal: resultado.valorTotal,
      autorizacao: resultado.autorizacao,
      numeroSequencial: resultado.CodStatusRespostaSefaz
    });

  }catch(erro) {
    console.error('Erro no controller:', erro);
    return res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

module.exports = {
  emitirNotaFiscal,
  emitirNotaFiscalAvulsa,
  listaNotaFiscal,
  getNotaFiscal,
  cancelarNotaFiscal
};