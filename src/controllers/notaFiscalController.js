const { emitirNFe, emitirNFCe } = require('../services/emissaoService');
const Venda = require('../models/Venda');
// const { emitirNFCeViaNuvemFiscal } = require('../services/nfceNuvemFiscalService');
const Empresa = require('../models/Empresa');

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

    console.log('Empresa: ', empresa.tipoNF);
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
}

module.exports = {
  emitirNotaFiscal
};