const axios = require('axios');
const montarJsonNFe = require('../notas/montarJsonNFe');
const montarJsonNFeAvulsa = require('../notas/montarJsonNFeAvulsa');
const NotaFiscal = require('../models/NotaFiscal');
const { json } = require('sequelize');
const Venda = require('../models/Venda');
const montarJsonCancelNFe = require('../notas/montarJsonCancelNFe');
const Integracao = require('../models/Integracao');
const sequelize = require('../database/connection');
const nodemailer = require('nodemailer');
const NotaFiscalAvulsa = require('../models/NotaFiscalAvulsa');

async function getNFIntegracao(empresa) {
  const where = {
    idEmpresa: empresa,
    tipoIntegracao: "NF",
    nomeIntegracao: "BrasilNFe"
  };

  const integracao = await Integracao.findOne({ where });

  if (!integracao) {
    throw new Error("Integração NF não encontrada para esta empresa");
  }

  return {
    baseUrl: integracao.url,
    token: integracao.token
    
  };
};

async function emitirNFe(venda, empresa) {
  const transaction = await sequelize.transaction();

  const jsonNFe = await montarJsonNFe(venda, empresa);

  // console.log('JSON da NFe/NFCe montado:', JSON.stringify(jsonNFe, null, 2));

  try {
    const { baseUrl, token } = await getNFIntegracao(empresa.idEmpresa);
    // console.log('url', baseUrl);
    // console.log('token: ', token);
    const response = await axios.post(
      // `${NF_BASE_URL}/nfe`,
      `${baseUrl}/EnviarNotaFiscal`,
      jsonNFe,
      {
        headers: {
          // Authorization: `Bearer ${TokenBearer}`, 
          Token: `${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    // console.log("data:", data);

    // grava no banco com Sequelize
    const notaFiscal = await NotaFiscal.create({
      idEmpresa: empresa.idEmpresa,
      idVenda: venda.id,
      tipo: "NF-e",
      DsEvento: "Envio",
      numero: data.ReturnNF.Numero || null,
      serie: data.ReturnNF.Serie || 1,
      chave: data.ReturnNF.ChaveNF || null,
      protocolo: data.ReturnNF?.Protocolo || null,
      CodStatusRespostaSefaz: data.ReturnNF.CodStatusRespostaSefaz || null,
      // CodStatusRespostaSefaz: 100,
      DsStatusRespostaSefaz: data.ReturnNF.DsStatusRespostaSefaz || null,
      // DsStatusRespostaSefaz: 'Autorizado uso da NF-e',
      CodAmbiente: jsonNFe.TipoAmbiente || null,
      DsTipoAmbiente: jsonNFe.TipoAmbiente === 1 ? "Produção" : "Homologação",
      valorNf: data.ReturnNF.Detalhes.valorNf || null,
      xml: data.Base64Xml || null,
      pdfBase64: data.Base64File || null,
      danfePath: null, // se você salvar em disco, coloca o path aqui
      idNuvemFiscal: data.id || null,
      digest_value: data.digest_value || null,
      erroProcessamento: data.Error,
      // status: data.ReturnNF.Ok || false,
      status: data.ReturnNF.Ok || true,
    });

    const CodStatusRespostaSefaz = notaFiscal.CodStatusRespostaSefaz;
    //  console.log('CodStatusRespostaSefaz: ', CodStatusRespostaSefaz);

    // Verifica se nota foi aprovada para atualizar venda
      if (CodStatusRespostaSefaz === 100) {
        await Venda.update(
            { idNotaFiscal: notaFiscal.id, 
              notaFiscalEmitida: true },
            {
                where: { 
                    id: notaFiscal.idVenda,        
                    idEmpresa: notaFiscal.idEmpresa 
                },
                transaction
            }
        );

        // ----- ENVIA E-MAIL -----
        if (empresa.emailXML) {
          // console.log(`Enviando e-mail do XML para ${empresa.emailXML}...`);

          let transporter = nodemailer.createTransport({
              host: 'smtp.hostinger.com',    // Servidor SMTP da Locaweb
              port: 465,                    // Porta do SMTP com TLS
              secure: true,                 // Usando TLS (não SSL)
              auth: {
              user: 'fabio.meira@optware.com.br',  
              pass: 'Optware@2025',           
              },
          });

          const attachments = [];

          // Anexa o XML
          if (notaFiscal.xml) {
            const xmlBuffer = Buffer.from(notaFiscal.xml, 'base64');
            attachments.push({
              filename: `${notaFiscal.chave}.xml`,
              content: xmlBuffer,
              contentType: 'application/xml'
            });
          }

          // // Anexa o DANFE PDF, se existir
          // if (notaFiscal.pdfBase64) {
          //   const pdfBuffer = Buffer.from(notaFiscal.pdfBase64, 'base64');
          //   attachments.push({
          //     filename: `${notaFiscal.chave}.pdf`,
          //     content: pdfBuffer,
          //     contentType: 'application/pdf'
          //   });
          // }

          await transporter.sendMail({
            from: `contato@optware.com.br`,
            to: empresa.emailXML,
            subject: `NF-e nº ${notaFiscal.numero} - Autorizada pela SEFAZ`,
            text: `Segue em anexo o XML e o DANFE da NF-e nº ${notaFiscal.numero}, série ${notaFiscal.serie}.`,
            attachments
          });

          // console.log("E-mail enviado com sucesso para o contador!");
      }
    };

    await transaction.commit();

    return {
        sucesso: true,
        id: data.id,
        chaveAcesso: data.chave,
        status: data.status,
        dataEmissao: data.data_emissao,
        valorTotal: data.valor_total,
        autorizacao: {
        id: data.autorizacao?.id || null,
        status: data.autorizacao?.status || null,
        codigoStatus: data.autorizacao?.codigo_status || null,
        motivoStatus: data.autorizacao?.motivo_status || null,
        dataRecebimento: data.autorizacao?.data_recebimento || null
        }
    };
  
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao emitir NF-e:', error.response?.data || error.message);
    return {
      sucesso: false,
      erro: error.response?.data || error.message
    };
  }
}

async function emitirNFeAvulsa(notaAvulsa, empresa) {
  const transaction = await sequelize.transaction();

  const jsonNFe = await montarJsonNFeAvulsa(notaAvulsa, empresa);

  // console.log('JSON da NFe/NFCe Avulsa montado:', JSON.stringify(jsonNFe, null, 2));

  try {
    const { baseUrl, token } = await getNFIntegracao(empresa.idEmpresa);
    // console.log('url', baseUrl);
    // console.log('token: ', token);
    const response = await axios.post(
      // `${NF_BASE_URL}/nfe`,
      `${baseUrl}/EnviarNotaFiscal`,
      jsonNFe,
      {
        headers: {
          // Authorization: `Bearer ${TokenBearer}`, 
          Token: `${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    // console.log("data:", data);
    // console.log('idNotaFiscal: ', notaAvulsa.id);

    // grava no banco com Sequelize
    const notaFiscal = await NotaFiscal.create({
      idEmpresa: empresa.idEmpresa,
      idNotaAvulsa: notaAvulsa.id,
      tipo: "NF-e",
      DsEvento: "Envio",
      numero: data.ReturnNF.Numero || null,
      serie: data.ReturnNF.Serie || null,
      chave: data.ReturnNF.ChaveNF || null,
      protocolo: data.ReturnNF?.Protocolo || null,
      CodStatusRespostaSefaz: data.ReturnNF.CodStatusRespostaSefaz || null,
      // CodStatusRespostaSefaz: 100,
      DsStatusRespostaSefaz: data.ReturnNF.DsStatusRespostaSefaz || null,
      // DsStatusRespostaSefaz: 'Autorizado uso da NF-e',
      CodAmbiente: jsonNFe.TipoAmbiente || null,
      DsTipoAmbiente: jsonNFe.TipoAmbiente === 1 ? "Produção" : "Homologação",
      valorNf: data.ReturnNF.Detalhes.valorNf || null,
      xml: data.Base64Xml || null,
      pdfBase64: data.Base64File || null,
      danfePath: null, // se você salvar em disco, coloca o path aqui
      idNuvemFiscal: data.id || null,
      digest_value: data.digest_value || null,
      erroProcessamento: data.Error,
      // status: data.ReturnNF.Ok || false,
      status: data.ReturnNF.Ok || true,
    });

    const CodStatusRespostaSefaz = notaFiscal.CodStatusRespostaSefaz;
    // console.log('CodStatusRespostaSefaz: ', CodStatusRespostaSefaz);

    // Verifica se nota foi aprovada para atualizar venda
      if (CodStatusRespostaSefaz === 100) {
        await NotaFiscalAvulsa.update(
            { idNotaFiscal: notaFiscal.id, 
              notaFiscalEmitida: true },
            {
                where: { 
                    id: notaFiscal.idNotaAvulsa,        
                    idEmpresa: notaFiscal.idEmpresa 
                },
                transaction
            }
        );

        // ----- ENVIA E-MAIL -----
        if (empresa.emailXML) {
          // console.log(`Enviando e-mail do XML para ${empresa.emailXML}...`);

          let transporter = nodemailer.createTransport({
              host: 'smtp.hostinger.com',    // Servidor SMTP da Locaweb
              port: 465,                    // Porta do SMTP com TLS
              secure: true,                 // Usando TLS (não SSL)
              auth: {
              user: 'fabio.meira@optware.com.br',  
              pass: 'Optware@2025',           
              },
          });

          const attachments = [];

          // Anexa o XML
          if (notaFiscal.xml) {
            const xmlBuffer = Buffer.from(notaFiscal.xml, 'base64');
            attachments.push({
              filename: `${notaFiscal.chave}.xml`,
              content: xmlBuffer,
              contentType: 'application/xml'
            });
          }

          // // Anexa o DANFE PDF, se existir
          // if (notaFiscal.pdfBase64) {
          //   const pdfBuffer = Buffer.from(notaFiscal.pdfBase64, 'base64');
          //   attachments.push({
          //     filename: `${notaFiscal.chave}.pdf`,
          //     content: pdfBuffer,
          //     contentType: 'application/pdf'
          //   });
          // }

          await transporter.sendMail({
            from: `contato@optware.com.br`,
            to: empresa.emailXML,
            subject: `NF-e nº ${notaFiscal.numero} - Autorizada pela SEFAZ`,
            text: `Segue em anexo o XML e o DANFE da NF-e nº ${notaFiscal.numero}, série ${notaFiscal.serie}.`,
            attachments
          });

          // console.log("E-mail enviado com sucesso para o contador!");
      }
    };

    await transaction.commit();

    return {
        sucesso: true,
        id: data.id,
        chaveAcesso: data.chave,
        status: data.status,
        dataEmissao: data.data_emissao,
        valorTotal: data.valor_total,
        autorizacao: {
        id: data.autorizacao?.id || null,
        status: data.autorizacao?.status || null,
        codigoStatus: data.autorizacao?.codigo_status || null,
        motivoStatus: data.autorizacao?.motivo_status || null,
        dataRecebimento: data.autorizacao?.data_recebimento || null
        }
    };
  
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao emitir NF-e:', error.response?.data || error.message);
    return {
      sucesso: false,
      erro: error.response?.data || error.message
    };
  }
}

async function emitirNFCe(venda, empresa) {
  const token = await getToken(empresa.id);

  const jsonNFCe = montarJsonNFCe(venda, empresa); // Também precisa implementar para nota fiscal consumidor eletrônica

  try {
    const response = await axios.post(
      `${NF_BASE_URL}/nfce`,
      jsonNFCe,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { chave, protocolo } = response.data;
    return {
      sucesso: true,
      chaveAcesso: chave,
      protocolo: protocolo
    };
  } catch (error) {
    console.error('Erro ao emitir NFC-e:', error.response?.data || error.message);
    return {
      sucesso: false,
      erro: error.response?.data || error.message
    };
  }
}

async function cancelarNFe(chave, empresa, justificativa) {

  const { baseUrl, token } = await getNFIntegracao(empresa);
  console.log('url', baseUrl);
  console.log('token: ', token);

  const jsonCancelamtento = montarJsonCancelNFe(chave, empresa, justificativa); 

  try {
    const response = await axios.post(
      `${baseUrl}/CancelNF`,
      jsonCancelamtento,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // const { chave, protocolo } = response.data;
    const data = response.data;
    console.log("data:", data);

    // grava no banco com Sequelize
    const notaFiscal = await NotaFiscal.create({
      idEmpresa: empresa.idEmpresa,
      tipo: "NF-e",
      DsEvento: data.DsEvento,
      DsMotivo:data.DsMotivo,
      chave: data.ReturnNF.ChaveNF || null,
      protocolo: data.NuProtocolo || null,
      CodStatusRespostaSefaz: data.CodStatusRespostaSefaz || null,
      DsStatusRespostaSefaz: data.ReturnNF.DsStatusRespostaSefaz || null,
      CodAmbiente: jsonNFe.TipoAmbiente || null,
      DsTipoAmbiente: data.DsAmbiente === 1 ? "Produção" : "Homologação",
      NumeroSequencial: data.NumeroSequencial || null,
      erroProcessamento: data.Error,
      status: data.ReturnNF.Ok || false,
    });

    const CodStatusRespostaSefaz = notaFiscal.CodStatusRespostaSefaz;

    return {
      sucesso: true,
      chaveAcesso: chave,
      protocolo: protocolo
    };

  } catch (error) {
    console.error('Erro ao cancelar NF-e:', error.response?.data || error.message);
    return {
      sucesso: false,
      erro: error.response?.data || error.message
    };
  }
}

module.exports = {
  emitirNFe,
  emitirNFeAvulsa,
  emitirNFCe,
  cancelarNFe
};
