// controllers/nfeController.js
const fs = require('fs');
const xml2js = require('xml2js');
const Produto = require('../models/Produto');
const Fornecedor = require('../models/Fornecedores');

const parser = new xml2js.Parser({ explicitArray: false });

async function uploadAndImportNFe(req, res) {
    try {
      const { idEmpresa } = req.params;
      const { idFornecedor } = req.body;
      const xmlPath = req.file.path;
  
      const xmlData = fs.readFileSync(xmlPath, 'utf8');
      const result = await parser.parseStringPromise(xmlData);
  
      const nfe = result.nfeProc?.NFe || result.NFe;
  
      if (!nfe || !nfe.infNFe || !nfe.infNFe.det) {
        return res.status(400).json({ error: 'XML inválido ou sem produtos.' });
      }
  
      const produtos = nfe.infNFe.det;
      const produtosArray = Array.isArray(produtos) ? produtos : [produtos];
  
      const produtosCadastrados = await Promise.all(
        produtosArray.map(async (item) => {
          const prod = item.prod;
  
          return Produto.create({
            idEmpresa: idEmpresa,
            idFornecedor: parseInt(idFornecedor), 
            referencia: prod.cProd,
            descricao: prod.xProd,
            codigoBarras: prod.cEAN !== 'SEM GTIN' ? prod.cEAN : null,
            precoCusto: parseFloat(prod.vUnCom || 0),
            estoque: parseFloat(prod.qCom || 0),
            estoqueDisponivel: parseFloat(prod.qCom || 0),
            idTipoProduto: 1,
            unidade: prod.uCom,
            ncm: prod.NCM,
            ativo: true,
            observacoes: 'Produto importado por arquivo XML',
          });
        })
      );
  
      fs.unlinkSync(xmlPath);
  
      return res.status(201).json({ message: 'Produtos importados com sucesso!', produtos: produtosCadastrados });
  
    } catch (error) {
      console.error('Erro ao importar XML:', error);
      return res.status(500).json({ error: 'Erro ao processar o XML.' });
    }
  }
  

module.exports = {
    uploadAndImportNFe
}