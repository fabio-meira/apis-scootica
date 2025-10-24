// notas/montarJsonCancelNFe.js
//  Monta o JSON conforme a documentação da BrasilNFe

async function montarJsonCancelNFe(chave, empresa, justificativa) {
  
  const json = {
    ChaveNF: chave,
    Justificativa: justificativa,
    NumeroSequencial: 1,
  };
  // 🔥 Log do JSON
  console.log("JSON cancel gerado para envio à BrasilNFe:\n", JSON.stringify(json, null, 2));

  return json;
}

module.exports = montarJsonCancelNFe;