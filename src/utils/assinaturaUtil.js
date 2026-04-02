// assinaturaUtil.js
const forge = require('node-forge');
const { SignedXml } = require('xml-crypto');
const { DOMParser } = require('@xmldom/xmldom');
const { converterPkcs1ParaPkcs8 } = require('../utils/converterUtil'); 

/**
 * Assina um XML de NFC-e:<infNFe>.
 *
 * @param {string} rawXml — XML completo (string).
 * @param {string} chavePrivadaPem — PEM da chave (PKCS#8 ou PKCS#1).
 * @returns {string} — XML assinado.
 */

function assinarXML(rawXml, chavePrivadaPem) {
  // 1) Limpa espaços/BOM antes da primeira '<'
  let xml = rawXml.replace(/^[\s\uFEFF]+/, '');
  if (!xml.startsWith('<')) {
    throw new Error('assinarXML: XML não começa com “<” após limpeza');
  }

  console.log('keyPem antes da conversão:', chavePrivadaPem);
const chaveParaAssinar = converterPkcs1ParaPkcs8(chavePrivadaPem);
console.log('keyPem após conversão:', chaveParaAssinar);

  // 2) Extrai o <infNFe> só para pegar o Id
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const infNFe = doc.getElementsByTagNameNS(
    'http://www.portalfiscal.inf.br/nfe',
    'infNFe'
  )[0];
  if (!infNFe) {
    throw new Error('assinarXML: <infNFe> não encontrado no XML');
  }
  const id = infNFe.getAttribute('Id');
  if (!id) {
    throw new Error('assinarXML: atributo Id ausente em <infNFe>');
  }

  // 3) Prepara a chave (converte PKCS#1 → PKCS#8 se necessário)
  const signingKey = converterPkcs1ParaPkcs8(keyPem);
  console.log('signingKey: ', signingKey);
  if (!signingKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('assinarXML: chave para assinatura inválida');
  }
  
  // Prepara a chave
//   let signingKey = chavePrivadaPem.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
//   signingKey = converterPkcs1ParaPkcs8(signingKey);

//   if (!signingKey.includes('BEGIN PRIVATE KEY')) {
//     throw new Error('assinarXML: chave para assinatura inválida');
//   }

//   const signingKey = chavePrivadaPem.includes('BEGIN RSA PRIVATE KEY')
//     ? converterPkcs1ParaPkcs8(chavePrivadaPem)
//     : chavePrivadaPem;
console.log('signingKey: ', signingKey);
//     if (!signingKey.includes('BEGIN PRIVATE KEY')) {
//     throw new Error('assinarXML: chave para assinatura inválida');
//   }

  // 4) Configura a assinatura
  const sig = new SignedXml();
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
  sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

  sig.addReference({
    xpath: `//*[@Id='${id}']`,
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#'
    ],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
  });

  sig.signingKey = signingKey;

  sig.keyInfoProvider = { getKeyInfo: () => '<X509Data></X509Data>' };

  // 5) Computa a assinatura **usando a string XML**
  sig.computeSignature(xml, {
    location: {
      // XPath ignorando namespace para injetar a Signature
      reference: "//*[local-name(.)='infNFe']",
      action: 'after'
    }
  });

  // 6) Retorna XML assinado
  return sig.getSignedXml();
}

module.exports = assinarXML;

