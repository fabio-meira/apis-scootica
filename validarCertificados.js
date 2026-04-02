const forge = require('node-forge');
const { Sequelize, DataTypes } = require('sequelize');

// Ajuste com seus dados de conexão
const sequelize = new Sequelize('otica', 'root', 'fmeira77', {
  host: 'localhost',
  dialect: 'mysql',
});

const Certificado = sequelize.define('certificado', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  idEmpresa: DataTypes.INTEGER,
  cnpj: DataTypes.STRING,
  certbase64: DataTypes.TEXT('long'),
  certpass: DataTypes.STRING,
  ativo: DataTypes.BOOLEAN,
}, {
  tableName: 'certificadoDigital',
  timestamps: true,
});

async function testarCertificado(certificado) {
  const { id, idEmpresa, cnpj, certbase64, certpass } = certificado;

  try {
    const pfxBuffer = Buffer.from(certbase64.replace(/(\r\n|\n|\r)/gm, ''), 'base64');
    const pfxBinary = pfxBuffer.toString('binary');
    const p12Asn1 = forge.asn1.fromDer(pfxBinary);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certpass);

    let chavePrivadaPem = null;
    let certificadoPem = null;

    for (const safeContent of p12.safeContents) {
      for (const safeBag of safeContent.safeBags) {
        if (
          safeBag.type === forge.pki.oids.keyBag ||
          safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag
        ) {
          chavePrivadaPem = forge.pki.privateKeyToPem(safeBag.key);
        }
        if (safeBag.type === forge.pki.oids.certBag) {
          certificadoPem = forge.pki.certificateToPem(safeBag.cert);
        }
      }
    }

    if (!chavePrivadaPem || !certificadoPem) {
      throw new Error('Não foi possível extrair chave privada ou certificado.');
    }

    console.log(`✅ Certificado ID ${id} (Empresa ${idEmpresa} - CNPJ ${cnpj}): VÁLIDO`);
  } catch (err) {
    console.error(`❌ Certificado ID ${id} (Empresa ${idEmpresa} - CNPJ ${cnpj}):`, err.message);
  }
}

async function validarTodosCertificados() {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco com sucesso.');

    const certificados = await Certificado.findAll({ where: { ativo: true } });

    for (const cert of certificados) {
      await testarCertificado(cert);
    }

    await sequelize.close();
  } catch (error) {
    console.error('Erro ao conectar ou processar:', error.message);
  }
}

validarTodosCertificados();
