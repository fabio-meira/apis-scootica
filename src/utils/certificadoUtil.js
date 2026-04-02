// src/utils/certificadoUtil.js
const forge = require('node-forge');
const Certificado = require('../models/CertificadoDigital');
const Empresa = require('../models/Empresa');

async function obterCertificadoEmpresa(idEmpresa) {
  const certEmpresa = await Certificado.findOne({
    where: { idEmpresa, ativo: true },
  });
  if (!certEmpresa) throw new Error('Certificado não encontrado.');

  const { certBase64, certPass } = certEmpresa;
  if (!certBase64 || !certPass) throw new Error('Dados do certificado incompletos.');

  const pfxDer = Buffer.from(certBase64.replace(/(\r\n|\n|\r)/gm, ''), 'base64').toString('binary');
  const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(pfxDer), certPass);

  let chavePem, certPem;
  p12.safeContents.forEach(sc =>
    sc.safeBags.forEach(sb => {
      if (!chavePem && (sb.type === forge.pki.oids.keyBag || sb.type === forge.pki.oids.pkcs8ShroudedKeyBag)) {
        chavePem = forge.pki.privateKeyToPem(sb.key);
      }
      if (!certPem && sb.type === forge.pki.oids.certBag) {
        certPem = forge.pki.certificateToPem(sb.cert);
      }
    })
  );
  // console.log('certif chavePem:', chavePem);

  if (!chavePem || !certPem) throw new Error('Não foi possível extrair chave ou certificado.');
  console.log('certificadoUtil obterCertificadoEmpresa keyPem:', chavePem ? '[ok]' : '[vazio]');

  const empresa = await Empresa.findOne({ where: { idEmpresa } });
  if (!empresa) throw new Error('Empresa não encontrada.');

  return { cert: certPem, key: chavePem, passphrase: certPass, empresa: empresa };
}

module.exports = { obterCertificadoEmpresa };
