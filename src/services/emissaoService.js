const axios = require('axios');
const montarJsonNFe = require('../notas/montarJsonNFe');
// const NUVEM_FISCAL_BASE_URL = 'https://api.nuvemfiscal.com.br';
const NUVEM_FISCAL_BASE_URL = 'https://api.sandbox.nuvemfiscal.com.br';
const TokenBearer = 'eyJ0eXAiOiJKV1QiLCJraWQiOiIwMWIwNDFkMWQ2MTU0NjA0NzNkMWI1NGFhOGRlNGQ1NyIsImFsZyI6IlJTMjU2In0.eyJzY29wZSI6ImNlcCBjbnBqIG5mc2UgbmZlIiwianRpIjoiYWRkYTNmNTktMDBmMy00NzBlLWI1M2EtYWIwZDBkYmYzOTExIiwiaHR0cHM6Ly9udXZlbWZpc2NhbC5jb20uYnIvdGVuYW50X2lkIjoiM2ExYmRmNDMtNTQxOC00NTJlLWJhYzEtOTA1MDc5MTIyM2VlIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLm51dmVtZmlzY2FsLmNvbS5iciIsImF1ZCI6Imh0dHBzOi8vYXBpLnNhbmRib3gubnV2ZW1maXNjYWwuY29tLmJyLyIsImV4cCI6MTc1ODkxMTA2NywiaWF0IjoxNzU2MzE5MDY3LCJjbGllbnRfaWQiOiJaM3dSTThteE5XMWMyZU95THI5NiJ9.haWnHDVRY_IbgVGmn262Gm5G_pvPmWg0mnPMMfJbvjFut9vL79A7ScAOw0o0lEWxuEh71br6jexbVY9Zg0niNypvR9dySopNV5kyF2B50TuB-vWZrbdsWkAFsDF0gHlcgc8DjOqrgDeSQHKeeV_Hc2VOXURZc71fgwhSM2ucuu3n7dZpRJl8wxYcYtlDBnTHs6MoGYGix3l2lceFSCMlYmm86JQeVzoLfF3cxgglChC_n9b5vgoJ0pwO95wE699ywRCk-h3T8cy8QMRCva6VNWZ_05sp4muvu0w4Iwak5FOH-RuA6-HSh5tx_RV7ev9mfK3q7m5F2tRaibDkrCPGOg';
// const getToken = require('../utils/getToken'); // Você pode criar uma função utilitária que busca o token do banco
const getToken = TokenBearer;

async function emitirNFe(venda, empresa) {
//   const token = await getToken(empresa.id);
  const token = TokenBearer;

  const jsonNFe = montarJsonNFe(venda, empresa); // Aqui você implementa sua montagem do JSON
 
  console.log('JSON da NFe/NFCe montado:', JSON.stringify(jsonNFe, null, 2));

  try {
    const response = await axios.post(
      `${NUVEM_FISCAL_BASE_URL}/nfe`,
      jsonNFe,
      {
        headers: {
          Authorization: `Bearer ${TokenBearer}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

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
      `${NUVEM_FISCAL_BASE_URL}/nfce`,
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

module.exports = {
  emitirNFe,
  emitirNFCe
};
