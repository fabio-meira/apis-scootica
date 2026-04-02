const forge = require('node-forge');

/**
 * Converte PEM PKCS#1 (RSA PRIVATE KEY) → PEM PKCS#8 (PRIVATE KEY).
 *
 * @param {string} chavePkcs1Pem — texto PEM que comece com "-----BEGIN RSA PRIVATE KEY-----"
 * @returns {string} texto PEM no formato "-----BEGIN PRIVATE KEY-----"
 */

function converterPkcs1ParaPkcs8(chavePkcs1Pem) {
  if (!chavePkcs1Pem || typeof chavePkcs1Pem !== 'string') {
    throw new Error('converterPkcs1ParaPkcs8: parâmetro inválido');
  }
  if (!chavePkcs1Pem.includes('BEGIN RSA PRIVATE KEY')) {
    throw new Error('converterPkcs1ParaPkcs8: não detectei PEM PKCS#1');
  }

  // 1) Extrai objeto RSA
  const rsaKey = forge.pki.privateKeyFromPem(chavePkcs1Pem);

  // 2) Converte objeto RSA em ASN.1
  const rsaAsn1 = forge.pki.privateKeyToAsn1(rsaKey);

  // 3) Envolve esse ASN.1 num PrivateKeyInfo (PKCS#8)
  const pkcs8Asn1 = forge.pki.wrapRsaPrivateKey(rsaAsn1);

  // 4) Converte ASN.1 PKCS#8 em PEM
  const pkcs8Pem = forge.pki.privateKeyInfoToPem(pkcs8Asn1);

  if (!pkcs8Pem.includes('BEGIN PRIVATE KEY')) {
    throw new Error('converterPkcs1ParaPkcs8: saída não é PKCS#8');
  }
  return pkcs8Pem;
}

module.exports = { converterPkcs1ParaPkcs8 };



