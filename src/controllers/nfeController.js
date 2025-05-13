const xml2js = require('xml2js');
const Produto = require('../models/Produto');
const { s3, BUCKET, PutObjectCommand } = require('../../config/s3Client');
const { Op } = require('sequelize');
const sequelize = require('../database/connection');

const parser = new xml2js.Parser({ explicitArray: false });

// Helper para enviar buffer ao S3
async function uploadBufferToS3(buffer, filename) {
  const key = `xmls/${Date.now()}_${filename}`;
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'text/xml'
  });
  await s3.send(cmd);
  return key;
}

async function uploadAndImportNFe(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const { idEmpresa } = req.params;
    const { idFornecedor } = req.body;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Arquivo XML não enviado' });
    }

    // 1. Envia o XML para o S3
    const s3Key = await uploadBufferToS3(req.file.buffer, req.file.originalname);

    // 2. Parseia o XML diretamente do buffer
    const xmlData = req.file.buffer.toString('utf-8');
    const result = await parser.parseStringPromise(xmlData);

    const nfe = result.nfeProc?.NFe || result.NFe;
    if (!nfe?.infNFe?.det) {
      return res.status(400).json({ error: 'XML inválido ou sem produtos.' });
    }

    const dets = Array.isArray(nfe.infNFe.det) ? nfe.infNFe.det : [nfe.infNFe.det];

    const produtosCadastrados = await Promise.all(
      dets.map(async item => {
        const p = item.prod;
        const referencia = p.cProd;
        const codigoBarras = p.cEAN !== 'SEM GTIN' ? p.cEAN : null;
        const quantidade = parseFloat(p.qCom) || 0;

        // Verifica se o produto já existe
        const produtoExistente = await Produto.findOne({
          where: {
            idEmpresa,
            [Op.or]: [
              { referencia },
              { codigoBarras: codigoBarras || '' } // Se não houver código de barras, procura por referência
            ]
          }
        });

        if (produtoExistente) {
          // Atualiza apenas o estoque
          produtoExistente.estoque += quantidade;
          produtoExistente.estoqueDisponivel += quantidade;
          await produtoExistente.save();
          return produtoExistente;
        } else {
          // Cria novo produto
          return Produto.create({
            idEmpresa,
            idFornecedor: parseInt(idFornecedor, 10),
            referencia,
            descricao: p.xProd,
            codigoBarras,
            precoCusto: parseFloat(p.vUnCom) || 0,
            preco: parseFloat(p.vUnCom) || 0,
            precoLucro: 0,
            estoque: quantidade,
            estoqueDisponivel: quantidade,
            tipoProduto: 'Produto',
            unidadeMedida: p.uCom === 'UN' ? 'Unidade' : '',
            ncm: p.NCM,
            ativo: true,
            movimentaEstoque: true,
            observacoes: 'Importado via arquivo XML',
          });
        }
      })
    );
    
    await transaction.commit(); 
    return res.status(201).json({
      message: 'Produtos importados com sucesso!',
      s3Key,
      produtos: produtosCadastrados
    });

  } catch (err) {
    await transaction.rollback(); 
    console.error('Erro ao importar XML:', err);
    return res.status(500).json({ error: 'Erro ao processar o XML.' });
  }
}

module.exports = { uploadAndImportNFe };
