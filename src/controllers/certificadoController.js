const CertificadoDigital = require('../models/CertificadoDigital');

async function salvarCertificado(req, res) {
  try {
    const { idEmpresa, cnpj } = req.params;

    if (!req.file) {
      return res.status(400).json({ erro: 'Certificado (.pfx) não enviado.' });
    }

    const senha = req.body.senha; 
    if (!senha) {
      return res.status(400).json({ erro: 'Senha do certificado não enviada.' });
    }

    // Converte o buffer do arquivo para base64
    const certBase64 = req.file.buffer.toString('base64');
    console.log('certificado', certBase64);

    const novoCertificado = await CertificadoDigital.create({
      idEmpresa,
      cnpj,
      certBase64,
      certPass: senha,
      ativo: true
    });

    return res.status(201).json({
      mensagem: 'Certificado salvo com sucesso',
      id: novoCertificado.id
    });
  } catch (err) {
    console.error('Erro ao salvar certificado:', err);
    return res.status(500).json({ erro: 'Erro interno ao salvar o certificado.' });
  }
}

module.exports = {
  salvarCertificado
};