const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Cobrador = require('../models/Cobrador');
const ParametroJuros = require('../models/parametrosJuros');
const Crediario = require('../models/Crediario');
const ParcelaCrediario = require('../models/parcelasCrediario');
const { Op } = require('sequelize');
const { addMonths } = require('date-fns'); // npm i date-fns

// Função para calcular valor final com juros simples
function calcularParcelasComJuros(valor, juros, parcelas) {
  const jurosDecimal = juros / 100;
  const valorFinal = valor * (1 + jurosDecimal);
  const valorParcela = valorFinal / parcelas;
  return parseFloat(valorParcela.toFixed(2));
}

// Criação de crediário
async function postCrediario(req, res) {
    const { idEmpresa } = req.params; 
    const crediarioData = req.body;

  try {
    // Buscar o juros ativo
    const parametro = await ParametroJuros.findOne({ where: { ativo: true } });
    if (!parametro) return res.status(400).json({ erro: 'Parâmetro de juros não encontrado' });

    const juros = parseFloat(parametro.juros_mensal);
    const valorParcela = calcularParcelasComJuros(valor_total, juros, parcelas);

    // Adiciona o idEmpresa que vem na rota
    crediarioData.idEmpresa = idEmpresa;

    // Criar crediário
    const crediario = await Crediario.create(crediarioData);

    // Gerar parcelas
    const parcelasGeradas = [];
    let vencimentoAtual = new Date(primeiro_vencimento);

    for (let i = 1; i <= parcelas; i++) {
      parcelasGeradas.push({
        id_crediario: crediario.id,
        numero_parcela: i,
        vencimento: vencimentoAtual,
        valor: valorParcela
      });
      vencimentoAtual = addMonths(vencimentoAtual, 1); // Próximo mês
    }

    await ParcelaCrediario.bulkCreate(parcelasGeradas);

    return res.status(201).json({
      mensagem: 'Crediário criado com sucesso!',
      crediario,
      parcelas: parcelasGeradas
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao criar crediário' });
  }
}

module.exports = { 
    postCrediario 
};
