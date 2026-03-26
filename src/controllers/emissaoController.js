const Venda = require('../models/Venda.js');
const { emitirNfceCompleta } = require('./emitirNFCeController');

async function emitirNFCe(req, res) {
  const { idVenda } = req.body;
  const { idEmpresa } = req.params;

  if (!idVenda) return res.status(400).json({ erro: 'idVenda é obrigatório' });

  try {
    const venda = await Venda.findOne({
      where: { id: idVenda, idEmpresa },
      include: ['cliente', 'produtos', 'pagamentos', 'empresa']
    });

    if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });

    const resultado = await emitirNfceCompleta(venda, idEmpresa);

    if (!resultado.sucesso) {
      return res.status(400).json({ erro: resultado.erro });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: 'NFC-e emitida com sucesso',
      dados: resultado
    });

  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

module.exports = { emitirNFCe };
