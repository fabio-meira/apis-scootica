const xml2js = require('xml2js');
const Produto = require('../models/Produto');
const { s3, BUCKET, PutObjectCommand } = require('../../config/s3Client');

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
      dets.map(item => {
        const p = item.prod;
        console.log('valor da unidade no xml: ', p.uCom);
        // console.log('valor da unidade convertida: ', unidade);
        return Produto.create({
          idEmpresa,
          idFornecedor: parseInt(idFornecedor, 10),
          referencia: p.cProd,
          descricao: p.xProd,
          codigoBarras: p.cEAN !== 'SEM GTIN' ? p.cEAN : null,
          precoCusto: parseFloat(p.vUnCom) || 0,
          preco: parseFloat(p.vUnCom) || 0,
          precoLucro: 0,
          estoque: parseFloat(p.qCom) || 0,
          estoqueDisponivel: parseFloat(p.qCom) || 0,
          tipoProduto: 'Produto',
          unidade: p.uCom === 'UN' ? 'Unidade' : '',
          ncm: p.NCM,
          ativo: true,
          movimentaEstoque: true,
          observacoes: 'Importado via arquivo XML',
        });
      })
    );

    return res.status(201).json({
      message: 'Produtos importados com sucesso!',
      s3Key,
      produtos: produtosCadastrados
    });

  } catch (err) {
    console.error('Erro ao importar XML:', err);
    return res.status(500).json({ error: 'Erro ao processar o XML.' });
  }
}

module.exports = { uploadAndImportNFe };
